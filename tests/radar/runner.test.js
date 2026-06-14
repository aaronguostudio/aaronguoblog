import { describe, expect, it } from 'vitest'
import { runRadarTopic } from '../../scripts/radar/runner.js'

const topic = {
  slug: 'mobile-ai',
  name: 'Mobile AI',
  query: 'mobile AI',
  category: 'ai',
  cadence: 'daily',
  mode: 'quick',
  lookbackDays: 30,
  visibility: 'public',
  minRelevance: 5,
  sourceHints: {},
}

const report = {
  topic: 'mobile AI',
  range_from: '2026-05-15',
  range_to: '2026-06-14',
  generated_at: '2026-06-14T14:00:00Z',
  clusters: [],
  ranked_candidates: [],
  items_by_source: {},
  errors_by_source: {},
  warnings: [],
}

describe('runRadarTopic', () => {
  it('supports dry-run without repository writes', async () => {
    const result = await runRadarTopic({
      topic,
      dryRun: true,
      adapter: async () => ({ report, stderr: '', command: ['python3.12', 'last30days.py'] }),
      repository: undefined,
      today: '2026-06-14',
    })

    expect(result).toMatchObject({
      topicSlug: 'mobile-ai',
      status: 'dry_run',
      itemsSeen: 0,
      itemsWritten: 0,
    })
  })

  it('writes normalized items and pulse through the repository', async () => {
    const calls = []
    const repository = {
      upsertRadarTopic: async () => calls.push('topic'),
      createRadarRun: async () => 42,
      upsertRadarItems: async () => {
        calls.push('items')
        return [7]
      },
      upsertRadarPulse: async () => calls.push('pulse'),
      finishRadarRun: async () => calls.push('finish'),
    }

    const fullReport = {
      ...report,
      clusters: [{ cluster_id: 'c1', title: 'Cluster', candidate_ids: ['c1'], representative_ids: ['c1'], sources: ['reddit'], score: 10 }],
      ranked_candidates: [{
        candidate_id: 'c1',
        item_id: 'item-1',
        source: 'reddit',
        title: 'Mobile AI moves on-device',
        url: 'https://example.com/mobile-ai',
        snippet: 'Snippet',
        local_relevance: 0.9,
        freshness: 9,
        engagement: 100,
        source_quality: 1,
        rrf_score: 0.1,
        final_score: 90,
        explanation: 'Explanation',
        cluster_id: 'c1',
        source_items: [],
      }],
    }

    const result = await runRadarTopic({
      topic,
      dryRun: false,
      client: {},
      adapter: async () => ({ report: fullReport, stderr: '', command: [] }),
      repository,
      today: '2026-06-14',
    })

    expect(result.status).toBe('completed')
    expect(result.itemsSeen).toBe(1)
    expect(result.itemsWritten).toBe(1)
    expect(calls).toEqual(['topic', 'items', 'pulse', 'finish'])
  })
})
