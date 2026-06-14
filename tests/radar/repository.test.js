import { describe, expect, it } from 'vitest'
import {
  buildTopicRow,
  createRadarRun,
  upsertRadarItems,
} from '../../scripts/radar/repository.js'

function createFakeClient() {
  const calls = []
  return {
    calls,
    async execute(input) {
      calls.push(input)
      const sql = typeof input === 'string' ? input : input.sql
      if (sql.includes('INSERT INTO radar_runs')) return { lastInsertRowid: 42, rows: [] }
      if (sql.includes('SELECT id FROM radar_items')) return { rows: [{ id: 7 }] }
      return { rows: [] }
    },
  }
}

describe('radar repository', () => {
  it('builds topic rows with serialized source hints', () => {
    const row = buildTopicRow({
      slug: 'mobile-ai',
      name: 'Mobile AI',
      query: 'mobile AI',
      category: 'ai',
      cadence: 'daily',
      mode: 'quick',
      lookbackDays: 30,
      visibility: 'public',
      minRelevance: 5,
      sourceHints: { subreddits: ['LocalLLaMA'] },
    })

    expect(row).toEqual([
      'mobile-ai',
      'Mobile AI',
      'mobile AI',
      'ai',
      'daily',
      'quick',
      30,
      'public',
      5,
      '{"subreddits":["LocalLLaMA"]}',
    ])
  })

  it('creates a run and returns its id', async () => {
    const client = createFakeClient()
    await expect(createRadarRun(client, { topicSlug: 'mobile-ai', mode: 'quick', lookbackDays: 30 })).resolves.toBe(42)
    expect(client.calls[0].sql).toContain('INSERT INTO radar_runs')
  })

  it('upserts items and topic membership', async () => {
    const client = createFakeClient()
    const ids = await upsertRadarItems(client, {
      runId: 42,
      items: [{
        canonicalUrl: 'https://example.com/a',
        source: 'reddit',
        sourceItemId: 'reddit-1',
        url: 'https://example.com/a?utm_source=x',
        title: 'A',
        summary: 'Summary',
        aiSummary: 'AI summary',
        author: 'author',
        score: 100,
        relevance: 8,
        category: 'ai',
        topicSlug: 'mobile-ai',
        clusterId: 'c1',
        clusterTitle: 'Cluster',
        publishedAt: '2026-06-14T00:00:00Z',
        raw: { ok: true },
      }],
    })

    expect(ids).toEqual([7])
    expect(client.calls.some(call => call.sql.includes('INSERT INTO radar_items'))).toBe(true)
    expect(client.calls.some(call => call.sql.includes('INSERT INTO radar_item_topics'))).toBe(true)
  })
})
