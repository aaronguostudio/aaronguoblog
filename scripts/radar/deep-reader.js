import { createHash } from 'node:crypto'
import { getRadarTopics } from './config.js'
import {
  findDeepReadByFingerprint,
  getDeepReadCandidates,
  insertRadarDeepRead,
} from './repository.js'

export const DEFAULT_DEEP_READER_MODEL = 'gpt-4.1-mini'
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

export const DEEP_READ_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: bilingualStringSchema,
    question: bilingualStringSchema,
    synthesis: bilingualStringSchema,
    caveat: bilingualStringSchema,
    sources: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          url: { type: 'string' },
          title: bilingualStringSchema,
          finding: bilingualStringSchema,
        },
        required: ['url', 'title', 'finding'],
      },
    },
  },
  required: ['title', 'question', 'synthesis', 'caveat', 'sources'],
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function asText(value) {
  return typeof value === 'string' ? value.trim() : ''
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

export function buildDeepReadPrompt({ topic, items }) {
  const evidence = items.map((item, index) => ({
    evidenceId: index + 1,
    url: item.canonicalUrl || item.url,
    source: item.source,
    title: item.title,
    summary: item.summary,
    aiSummary: item.aiSummary,
    publishedAt: item.publishedAt,
    relevance: item.relevance,
    sightingCount: item.sightingCount,
    lastSeenAt: item.lastSeenAt,
  }))

  return `You are the Deep Reader for a technology signal system.

Topic: ${topic.name}
Topic query: ${topic.query}

Use only the supplied evidence below. Do not invent facts, benchmarks, dates, URLs, quotes, or product capabilities. Treat source summaries as evidence to synthesize, not as permission to browse or fill gaps. Separate what a company claims from what the evidence demonstrates. If the evidence is thin or promotional, say so in the caveat.

Return one concise bilingual research artifact. The title names the emerging shift. The question is the decision or uncertainty this research is trying to resolve. The synthesis should explain the shared mechanism across sources and why it matters to builders. The caveat should name the strongest limitation, missing evidence, or reason not to overgeneralize. Select 2-3 of the supplied URLs as sources and give each a concrete finding grounded in its supplied evidence.

Every field must be present in both English (en) and Simplified Chinese (zh). Return JSON only, matching the requested schema.

Evidence:
${JSON.stringify(evidence, null, 2)}`
}

export function createDeepReadFingerprint({ topic, items }) {
  const normalized = {
    topicSlug: topic.slug,
    items: items
      .map((item) => ({
        url: normalizeUrl(item.canonicalUrl || item.url),
        title: item.title,
        summary: item.summary,
        aiSummary: item.aiSummary,
        relevance: item.relevance,
        sightingCount: item.sightingCount,
        lastSeenAt: item.lastSeenAt,
      }))
      .sort((left, right) => left.url.localeCompare(right.url)),
  }

  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

export function parseDeepReadResponse(body, { allowedUrls = [] } = {}) {
  if (body?.error) {
    throw new Error(body.error.message || 'OpenAI Deep Reader request failed')
  }
  if (body?.choices?.[0]?.finish_reason === 'length') {
    throw new Error('OpenAI Deep Reader response was truncated')
  }

  const content = stripCodeFence(extractMessageContent(body))
  if (!content) throw new Error('OpenAI Deep Reader returned no content')

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('OpenAI Deep Reader returned invalid JSON')
  }

  const title = requireBilingualField(parsed.title, 'title')
  const question = requireBilingualField(parsed.question, 'question')
  const synthesis = requireBilingualField(parsed.synthesis, 'synthesis')
  const caveat = requireBilingualField(parsed.caveat, 'caveat')
  const allowedUrlSet = new Set(allowedUrls.map(normalizeUrl))
  const seenUrls = new Set()
  const sources = Array.isArray(parsed.sources)
    ? parsed.sources.flatMap((source, index) => {
        const url = normalizeUrl(source?.url)
        if (!url || !allowedUrlSet.has(url) || seenUrls.has(url)) return []
        seenUrls.add(url)
        return [
          {
            url,
            title: requireBilingualField(source.title, `sources[${index}].title`),
            finding: requireBilingualField(source.finding, `sources[${index}].finding`),
          },
        ]
      })
    : []

  if (sources.length < 2) {
    throw new Error('OpenAI Deep Reader must cite at least two supplied source URLs')
  }

  return { title, question, synthesis, caveat, sources }
}

export async function generateDeepRead({
  topic,
  items,
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_DEEP_READER_MODEL || DEFAULT_DEEP_READER_MODEL,
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
            'You produce careful, source-bounded research artifacts for a technology Signal. Never fabricate evidence.',
        },
        { role: 'user', content: buildDeepReadPrompt({ topic, items }) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'signal_deep_read',
          strict: true,
          schema: DEEP_READ_RESPONSE_SCHEMA,
        },
      },
      temperature: 0.2,
      max_completion_tokens: 1400,
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
      body.error?.message || `OpenAI Deep Reader request failed with HTTP ${response.status}`,
    )
  }

  return {
    status: 'completed',
    model,
    ...parseDeepReadResponse(body, {
      allowedUrls: items.map((item) => item.canonicalUrl || item.url),
    }),
  }
}

export async function runDeepReadPipeline({
  client,
  topics = getRadarTopics(),
  maxTopics = 1,
  today = todayIso(),
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_DEEP_READER_MODEL || DEFAULT_DEEP_READER_MODEL,
  fetchImpl = globalThis.fetch,
}) {
  const candidates = await getDeepReadCandidates(client, { topics, maxTopics })
  if (!candidates.length) return [{ status: 'skipped', reason: 'no-eligible-candidates' }]

  const results = []
  for (const candidate of candidates) {
    const { topic, items } = candidate
    const inputFingerprint = createDeepReadFingerprint({ topic, items })
    const previous = await findDeepReadByFingerprint(client, inputFingerprint)
    if (previous) {
      results.push({
        status: 'unchanged',
        topicSlug: topic.slug,
        threadSlug: topic.threadSlug,
        readAt: previous.read_at,
      })
      continue
    }

    if (!apiKey) {
      results.push({
        status: 'skipped',
        reason: 'missing-api-key',
        topicSlug: topic.slug,
        threadSlug: topic.threadSlug,
      })
      continue
    }

    try {
      const generated = await generateDeepRead({ topic, items, apiKey, model, fetchImpl })
      if (generated.status !== 'completed') {
        results.push({ ...generated, topicSlug: topic.slug, threadSlug: topic.threadSlug })
        continue
      }

      const id = await insertRadarDeepRead(client, {
        topicSlug: topic.slug,
        threadSlug: topic.threadSlug,
        readAt: today,
        inputFingerprint,
        title: generated.title,
        question: generated.question,
        synthesis: generated.synthesis,
        caveat: generated.caveat,
        sources: generated.sources,
        model: generated.model,
      })
      results.push({
        status: 'completed',
        id,
        topicSlug: topic.slug,
        threadSlug: topic.threadSlug,
        readAt: today,
        sourceCount: generated.sources.length,
      })
    } catch (error) {
      results.push({
        status: 'failed',
        topicSlug: topic.slug,
        threadSlug: topic.threadSlug,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}
