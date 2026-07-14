import { describe, expect, it, vi } from 'vitest'
import {
  generateDailyConclusion,
  parseDailyConclusionResponse,
  runDailyConclusionPipeline,
  selectDailyConclusionEvidence,
} from '../../scripts/radar/daily-conclusion.js'

const topics = [
  {
    slug: 'mobile-ai',
    name: 'Mobile AI',
    cadence: 'daily',
    visibility: 'public',
    minRelevance: 5,
  },
  {
    slug: 'coding-agents',
    name: 'Coding Agents',
    cadence: 'daily',
    visibility: 'public',
    minRelevance: 6,
  },
]

const rows = [
  {
    id: 11,
    canonical_url: 'https://example.com/mobile',
    url: 'https://example.com/mobile',
    source: 'web',
    title: 'On-device models expand phone automation',
    summary: 'Phone-native models are taking on longer action sequences.',
    ai_summary: 'Mobile AI workflows are becoming more autonomous.',
    published_at: '2026-06-14',
    topic_slug: 'mobile-ai',
    relevance: 9,
    score: 90,
  },
  {
    id: 22,
    canonical_url: 'https://example.com/coding',
    url: 'https://example.com/coding',
    source: 'github',
    title: 'Coding agents plan repository-level work',
    summary: 'Agent tools now coordinate specifications and implementation steps.',
    ai_summary: 'Coding agents are becoming workflow owners.',
    published_at: '2026-06-14',
    topic_slug: 'coding-agents',
    relevance: 9,
    score: 88,
  },
]

function responseBody(sourceItemIds = [11, 22]) {
  return {
    takeaway: {
      en: 'AI products are moving from isolated assistance toward owning longer workflows.',
      zh: 'AI 产品正从孤立辅助走向承担更长的工作流。',
    },
    sourceItemIds,
  }
}

function createClient({ previous = null } = {}) {
  const calls = []
  return {
    calls,
    async execute(statement) {
      calls.push(statement)
      if (statement.sql.includes('WITH latest_topic_runs')) {
        return {
          rows: [
            { id: 1, topic_slug: 'mobile-ai', status: 'completed' },
            { id: 2, topic_slug: 'coding-agents', status: 'completed' },
          ],
        }
      }
      if (statement.sql.includes('WITH daily_runs')) return { rows }
      if (statement.sql.includes('FROM radar_daily_conclusions') && statement.sql.includes('input_fingerprint')) {
        return { rows: previous ? [previous] : [] }
      }
      if (statement.sql.startsWith('INSERT INTO radar_daily_conclusions')) {
        return { rows: [] }
      }
      throw new Error(`Unexpected SQL: ${statement.sql}`)
    },
  }
}

describe('daily Radar conclusion', () => {
  it('selects distinct evidence across the daily topics before filling remaining slots', () => {
    const evidence = selectDailyConclusionEvidence({
      topicSlugs: ['mobile-ai', 'coding-agents'],
      items: [
        { id: 11, topicSlug: 'mobile-ai', url: 'https://example.com/mobile', relevance: 10, score: 100 },
        { id: 12, topicSlug: 'mobile-ai', url: 'https://example.com/mobile-2', relevance: 9, score: 99 },
        { id: 22, topicSlug: 'coding-agents', url: 'https://example.com/coding', relevance: 7, score: 60 },
      ],
    })

    expect(evidence.map((item) => item.id)).toEqual([11, 22, 12])
  })

  it('rejects citations that do not come from the supplied evidence', () => {
    expect(() => parseDailyConclusionResponse(
      { choices: [{ message: { content: JSON.stringify(responseBody([11, 999])) } }] },
      { allowedItemIds: [11, 22] },
    )).toThrow('must cite at least two supplied evidence item IDs')
  })

  it('requests strict source-bounded bilingual JSON from the model', async () => {
    let request
    const result = await generateDailyConclusion({
      date: '2026-06-14',
      evidence: rows.map((row) => ({
        id: row.id,
        canonicalUrl: row.canonical_url,
        url: row.url,
        source: row.source,
        title: row.title,
        summary: row.summary,
        aiSummary: row.ai_summary,
        publishedAt: row.published_at,
        topicSlug: row.topic_slug,
        relevance: row.relevance,
        score: row.score,
      })),
      apiKey: 'test-key',
      fetchImpl: async (_url, options) => {
        request = JSON.parse(options.body)
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(responseBody()) } }] }),
        }
      },
    })

    expect(result).toMatchObject({
      status: 'completed',
      sourceItemIds: [11, 22],
    })
    expect(request.response_format).toMatchObject({
      type: 'json_schema',
      json_schema: { name: 'daily_signal_conclusion', strict: true },
    })
    expect(request.messages[1].content).toContain('itemId')
    expect(request.messages[1].content).toContain('https://example.com/mobile')
  })

  it('persists one conclusion after all daily topic runs and does not leak a model call to readers', async () => {
    const client = createClient()
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(responseBody()) } }] }),
    }))

    const results = await runDailyConclusionPipeline({
      client,
      date: '2026-06-14',
      topics,
      enabled: true,
      apiKey: 'test-key',
      fetchImpl,
    })

    expect(results).toEqual([
      expect.objectContaining({ status: 'completed', date: '2026-06-14', evidenceCount: 2, sourceCount: 2 }),
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(client.calls.some((statement) => statement.sql.startsWith('INSERT INTO radar_daily_conclusions'))).toBe(true)
  })

  it('remains disabled unless the publisher opts into recurring model use', async () => {
    const client = createClient()
    const fetchImpl = vi.fn()

    await expect(runDailyConclusionPipeline({ client, topics, enabled: false, fetchImpl })).resolves.toEqual([
      { status: 'skipped', reason: 'disabled' },
    ])
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(client.calls).toEqual([])
  })

  it('uses its same-day fingerprint cache without a second model request', async () => {
    const client = createClient({ previous: { date: '2026-06-14' } })
    const fetchImpl = vi.fn()

    const results = await runDailyConclusionPipeline({
      client,
      date: '2026-06-14',
      topics,
      enabled: true,
      apiKey: 'test-key',
      fetchImpl,
    })

    expect(results).toEqual([
      expect.objectContaining({ status: 'unchanged', date: '2026-06-14', evidenceCount: 2 }),
    ])
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
