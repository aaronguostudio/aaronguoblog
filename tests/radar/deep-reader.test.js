import { describe, expect, it } from 'vitest'
import {
  generateDeepRead,
  parseDeepReadResponse,
  runDeepReadPipeline,
} from '../../scripts/radar/deep-reader.js'

const topic = {
  slug: 'coding-agents',
  name: 'Coding Agents',
  query: 'coding agents, agentic IDEs',
  cadence: 'daily',
  threadSlug: 'coding-agents-own-workflows',
  minRelevance: 6,
  deepRead: {
    enabled: true,
    minSources: 3,
    minSightingCount: 2,
    minRepeatedSources: 2,
    itemLimit: 10,
  },
}

const items = [
  {
    canonicalUrl: 'https://cursor.com/insights',
    url: 'https://cursor.com/insights',
    source: 'grounding',
    title: 'Cursor Developer Habits Report',
    summary: 'Agent-generated changes are increasingly reaching commits.',
    aiSummary: 'A high-relevance coding-agent workflow signal.',
    relevance: 10,
    sightingCount: 3,
    lastSeenAt: '2026-07-11 07:00:00',
  },
  {
    canonicalUrl: 'https://kiro.dev/',
    url: 'https://kiro.dev/',
    source: 'grounding',
    title: 'Kiro: agentic engineering',
    summary: 'Specs and parallel agents structure software work.',
    aiSummary: 'A high-relevance coding-agent workflow signal.',
    relevance: 9,
    sightingCount: 2,
    lastSeenAt: '2026-07-11 07:00:00',
  },
  {
    canonicalUrl: 'https://github.com/deepreinforce-ai/Ornith-1',
    url: 'https://github.com/deepreinforce-ai/Ornith-1',
    source: 'github',
    title: 'Ornith-1.0',
    summary: 'A self-improving agentic coding system.',
    aiSummary: 'A high-relevance coding-agent workflow signal.',
    relevance: 8,
    sightingCount: 2,
    lastSeenAt: '2026-07-11 07:00:00',
  },
]

function bilingual(value) {
  return { en: value, zh: `${value}（中文）` }
}

function responseBody() {
  return {
    title: bilingual('Coding agents are becoming workflow owners'),
    question: bilingual('What changes when agents own more of the loop?'),
    synthesis: bilingual('The interface is moving from code completion toward workflow delegation.'),
    caveat: bilingual('The evidence is mostly product claims and self-reported signals.'),
    sources: [
      { url: 'https://cursor.com/insights', title: bilingual('Cursor report'), finding: bilingual('Commits increasingly include agent-generated changes.') },
      { url: 'https://kiro.dev/', title: bilingual('Kiro'), finding: bilingual('Specs organize parallel agent work.') },
      { url: 'https://not-allowed.example/', title: bilingual('Unknown'), finding: bilingual('This source must be rejected.') },
    ],
  }
}

describe('Deep Reader output handling', () => {
  it('keeps only cited URLs that were supplied as evidence', () => {
    const parsed = parseDeepReadResponse(
      { choices: [{ message: { content: JSON.stringify(responseBody()) } }] },
      { allowedUrls: items.map((item) => item.url) },
    )

    expect(parsed.sources).toHaveLength(2)
    expect(parsed.sources.map((source) => source.url)).toEqual([
      'https://cursor.com/insights',
      'https://kiro.dev',
    ])
  })

  it('requests strict structured JSON from the model', async () => {
    let request
    const result = await generateDeepRead({
      topic,
      items,
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

    expect(result.status).toBe('completed')
    expect(request.model).toBe('gpt-4.1-mini')
    expect(request.response_format).toMatchObject({
      type: 'json_schema',
      json_schema: { name: 'signal_deep_read', strict: true },
    })
    expect(request.messages[1].content).toContain('https://cursor.com/insights')
  })
})

describe('runDeepReadPipeline', () => {
  it('selects repeated evidence and writes one structured read', async () => {
    const calls = []
    const client = {
      async execute(statement) {
        if (typeof statement === 'object' && statement.sql.startsWith('SELECT')) {
          if (statement.sql.includes('FROM radar_item_topics')) {
            return {
              rows: items.map((item) => ({
                canonical_url: item.canonicalUrl,
                url: item.url,
                source: item.source,
                title: item.title,
                summary: item.summary,
                ai_summary: item.aiSummary,
                relevance: item.relevance,
                sighting_count: item.sightingCount,
                last_seen_at: item.lastSeenAt,
              })),
            }
          }
          if (statement.sql.includes('FROM radar_deep_reads')) return { rows: [] }
        }
        if (typeof statement === 'object' && statement.sql.startsWith('INSERT INTO radar_deep_reads')) {
          calls.push(statement)
          return { lastInsertRowid: 42 }
        }
        throw new Error(`Unexpected SQL: ${statement.sql || statement}`)
      },
    }

    const results = await runDeepReadPipeline({
      client,
      topics: [topic],
      apiKey: 'test-key',
      today: '2026-07-12',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(responseBody()) } }] }),
      }),
    })

    expect(results).toEqual([
      expect.objectContaining({
        status: 'completed',
        id: 42,
        topicSlug: 'coding-agents',
        threadSlug: 'coding-agents-own-workflows',
        sourceCount: 2,
      }),
    ])
    expect(calls).toHaveLength(1)
  })

  it('skips a candidate without an API key', async () => {
    const client = {
      async execute(statement) {
        if (statement.sql.includes('FROM radar_item_topics')) {
          return { rows: items.map((item) => ({
            canonical_url: item.canonicalUrl,
            url: item.url,
            source: item.source,
            title: item.title,
            summary: item.summary,
            ai_summary: item.aiSummary,
            relevance: item.relevance,
            sighting_count: item.sightingCount,
            last_seen_at: item.lastSeenAt,
          })) }
        }
        if (statement.sql.includes('FROM radar_deep_reads')) return { rows: [] }
        throw new Error('should not inspect or write a read without an API key')
      },
    }

    await expect(runDeepReadPipeline({ client, topics: [topic], apiKey: '' })).resolves.toEqual([
      expect.objectContaining({ status: 'skipped', reason: 'missing-api-key' }),
    ])
  })
})
