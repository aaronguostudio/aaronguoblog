import { createHash } from 'node:crypto'
import { getRadarTopics } from './config.js'
import {
  findDailyConclusionByFingerprint,
  getDailyConclusionCandidates,
  upsertRadarDailyConclusion,
} from './repository.js'

export const DEFAULT_DAILY_CONCLUSION_MODEL = 'gpt-4.1-mini'
const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'

const bilingualStringSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    en: { type: 'string' },
    zh: { type: 'string' },
  },
  required: ['en', 'zh'],
}

export const DAILY_CONCLUSION_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    takeaway: bilingualStringSchema,
    sourceItemIds: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: { type: 'integer' },
    },
  },
  required: ['takeaway', 'sourceItemIds'],
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function asText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function asItemId(value) {
  const itemId = Number(value)
  return Number.isInteger(itemId) && itemId > 0 ? itemId : null
}

function normalizeUrl(value) {
  try {
    const url = new URL(value)
    url.hash = ''
    url.pathname = url.pathname.replace(/\/$/, '') || '/'
    url.searchParams.sort()
    return url.toString().replace(/\/$/, '')
  } catch {
    return asText(value).replace(/\/$/, '')
  }
}

function requireBilingualField(value, fieldName) {
  if (!value || typeof value !== 'object') {
    throw new Error(`${fieldName} must be a bilingual object`)
  }

  const en = asText(value.en)
  const zh = asText(value.zh)
  if (!en || !zh) throw new Error(`${fieldName} must contain non-empty en and zh values`)

  return { en, zh }
}

function extractMessageContent(body) {
  const content = body?.choices?.[0]?.message?.content
  if (Array.isArray(content)) {
    return content
      .filter((part) => part?.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('')
  }
  return typeof content === 'string' ? content : ''
}

function stripCodeFence(value) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function compareEvidence(left, right) {
  const relevanceDiff = Number(right.relevance || 0) - Number(left.relevance || 0)
  if (relevanceDiff !== 0) return relevanceDiff

  const scoreDiff = Number(right.score || 0) - Number(left.score || 0)
  if (scoreDiff !== 0) return scoreDiff

  const publishedDiff = String(right.publishedAt || '').localeCompare(
    String(left.publishedAt || ''),
  )
  if (publishedDiff !== 0) return publishedDiff

  return Number(right.id || 0) - Number(left.id || 0)
}

export function selectDailyConclusionEvidence({ items, topicSlugs }, limit = 3) {
  const sortedItems = [...items].sort(compareEvidence)
  const selected = []
  const seenUrls = new Set()

  const add = (item) => {
    if (!item || selected.length >= limit) return
    const url = normalizeUrl(item.canonicalUrl || item.url)
    if (!url || seenUrls.has(url)) return
    seenUrls.add(url)
    selected.push(item)
  }

  for (const topicSlug of topicSlugs) {
    add(sortedItems.find((item) => item.topicSlug === topicSlug))
  }
  for (const item of sortedItems) add(item)

  if (selected.length < 2) {
    throw new Error('Daily conclusion needs at least two unique, high-relevance evidence items')
  }

  return selected
}

export function buildDailyConclusionPrompt({ date, evidence }) {
  const suppliedEvidence = evidence.map((item) => ({
    itemId: item.id,
    topic: item.topicSlug,
    source: item.source,
    url: item.canonicalUrl || item.url,
    title: item.title,
    summary: item.summary,
    aiSummary: item.aiSummary,
    publishedAt: item.publishedAt,
    relevance: item.relevance,
  }))

  return `You are the editor of a technology Signal. Write one concise, reader-facing conclusion from the supplied daily evidence. This is not an item count or a list of themes: state the strongest pattern across the evidence and why it matters to builders.

Date: ${date}

Use only the evidence below. Do not invent facts, dates, benchmarks, URLs, quotes, product capabilities, or trends that are not supported by the supplied titles and summaries. If the evidence is narrow, make the conclusion appropriately cautious. Return both English (en) and Simplified Chinese (zh). Each version should be short enough to appear as the lead sentence in a compact homepage card.

Select exactly 2 or 3 supplied itemIds that directly support the conclusion. Return JSON only, matching the requested schema.

Evidence:
${JSON.stringify(suppliedEvidence, null, 2)}`
}

export function createDailyConclusionFingerprint({ date, evidence }) {
  const normalized = {
    date,
    evidence: evidence
      .map((item) => ({
        id: asItemId(item.id),
        url: normalizeUrl(item.canonicalUrl || item.url),
        title: asText(item.title),
        summary: asText(item.summary),
        aiSummary: asText(item.aiSummary),
        topicSlug: asText(item.topicSlug),
        relevance: Number(item.relevance || 0),
        score: Number(item.score || 0),
      }))
      .sort((left, right) => String(left.url).localeCompare(String(right.url))),
  }

  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

export function parseDailyConclusionResponse(body, { allowedItemIds = [] } = {}) {
  if (body?.error) {
    throw new Error(body.error.message || 'OpenAI daily conclusion request failed')
  }
  if (body?.choices?.[0]?.finish_reason === 'length') {
    throw new Error('OpenAI daily conclusion response was truncated')
  }

  const content = stripCodeFence(extractMessageContent(body))
  if (!content) throw new Error('OpenAI daily conclusion returned no content')

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('OpenAI daily conclusion returned invalid JSON')
  }

  const takeaway = requireBilingualField(parsed.takeaway, 'takeaway')
  const allowedIds = new Set(allowedItemIds.map(asItemId).filter(Boolean))
  const sourceItemIds = Array.isArray(parsed.sourceItemIds)
    ? parsed.sourceItemIds.map(asItemId).filter((itemId) => itemId && allowedIds.has(itemId))
    : []
  const uniqueSourceItemIds = [...new Set(sourceItemIds)]

  if (uniqueSourceItemIds.length < 2) {
    throw new Error('OpenAI daily conclusion must cite at least two supplied evidence item IDs')
  }

  return { takeaway, sourceItemIds: uniqueSourceItemIds }
}

export async function generateDailyConclusion({
  date,
  evidence,
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_DAILY_CONCLUSION_MODEL || DEFAULT_DAILY_CONCLUSION_MODEL,
  fetchImpl = globalThis.fetch,
}) {
  if (!apiKey) return { status: 'skipped', reason: 'missing-api-key', model }
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required')

  const response = await fetchImpl(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You produce concise, source-bounded conclusions for a technology Signal. Never fabricate evidence.',
        },
        { role: 'user', content: buildDailyConclusionPrompt({ date, evidence }) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'daily_signal_conclusion',
          strict: true,
          schema: DAILY_CONCLUSION_RESPONSE_SCHEMA,
        },
      },
      temperature: 0.2,
      max_completion_tokens: 420,
    }),
  })

  const rawBody = await response.text()
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    body = { error: { message: rawBody || `HTTP ${response.status}` } }
  }
  if (!response.ok) {
    throw new Error(
      body.error?.message || `OpenAI daily conclusion request failed with HTTP ${response.status}`,
    )
  }

  return {
    status: 'completed',
    model,
    ...parseDailyConclusionResponse(body, {
      allowedItemIds: evidence.map((item) => item.id),
    }),
  }
}

export async function runDailyConclusionPipeline({
  client,
  date = todayIso(),
  topics = getRadarTopics(),
  enabled = process.env.RADAR_DAILY_CONCLUSION_ENABLED === '1',
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_DAILY_CONCLUSION_MODEL || DEFAULT_DAILY_CONCLUSION_MODEL,
  fetchImpl = globalThis.fetch,
}) {
  if (!enabled) return [{ status: 'skipped', reason: 'disabled' }]
  if (!apiKey) return [{ status: 'failed', reason: 'missing-api-key' }]

  try {
    const candidates = await getDailyConclusionCandidates(client, { date, topics })
    if (candidates.items.length < 2) {
      return [{ status: 'skipped', reason: 'no-eligible-evidence', date }]
    }

    const evidence = selectDailyConclusionEvidence(candidates)
    const inputFingerprint = createDailyConclusionFingerprint({ date, evidence })
    const previous = await findDailyConclusionByFingerprint(client, { date, inputFingerprint })
    if (previous) {
      return [{ status: 'unchanged', date, evidenceCount: evidence.length }]
    }

    const generated = await generateDailyConclusion({ date, evidence, apiKey, model, fetchImpl })
    if (generated.status !== 'completed') {
      return [{ ...generated, date }]
    }

    const evidenceItemIds = evidence.map((item) => item.id)
    await upsertRadarDailyConclusion(client, {
      date,
      inputFingerprint,
      takeaway: generated.takeaway,
      evidenceItemIds,
      sourceItemIds: generated.sourceItemIds,
      runIds: candidates.runIds,
      model: generated.model,
    })

    return [
      {
        status: 'completed',
        date,
        evidenceCount: evidence.length,
        sourceCount: generated.sourceItemIds.length,
      },
    ]
  } catch (error) {
    return [
      {
        status: 'failed',
        date,
        error: error instanceof Error ? error.message : String(error),
      },
    ]
  }
}
