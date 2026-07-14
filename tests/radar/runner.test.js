import { describe, expect, it, vi } from 'vitest'
import { runRadar, runRadarTopic } from '../../scripts/radar/runner.js'

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

  it('writes normalized items and returns them for the daily aggregate pulse', async () => {
    const calls = []
    const repository = {
      upsertRadarTopic: async () => calls.push('topic'),
      createRadarRun: async () => 42,
      upsertRadarItems: async () => {
        calls.push('items')
        return [7]
      },
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
    })

    expect(result.status).toBe('completed')
    expect(result.itemsSeen).toBe(1)
    expect(result.itemsWritten).toBe(1)
    expect(result.pulseItems).toEqual([
      expect.objectContaining({ id: 7, topicSlug: 'mobile-ai' }),
    ])
    expect(calls).toEqual(['topic', 'items', 'finish'])
  })

  it('records a failed run when the adapter throws', async () => {
    const calls = []
    const repository = {
      upsertRadarTopic: async () => calls.push(['topic']),
      createRadarRun: async () => {
        calls.push(['run'])
        return 42
      },
      upsertRadarItems: async () => calls.push(['items']),
      finishRadarRun: async (_client, payload) => calls.push(['finish', payload]),
    }

    await expect(runRadarTopic({
      topic,
      dryRun: false,
      client: {},
      adapter: async () => {
        throw new Error('adapter failed')
      },
      repository,
    })).rejects.toThrow('adapter failed')

    expect(calls).toEqual([
      ['topic'],
      ['run'],
      ['finish', {
        runId: 42,
        status: 'failed',
        itemsSeen: 0,
        itemsWritten: 0,
        errorMessage: 'adapter failed',
      }],
    ])
  })
})

describe('runRadar', () => {
  it('retries a transient topic failure once before returning success', async () => {
    const attempts = new Map()
    let nextRunId = 1
    const calls = []
    const repository = {
      upsertRadarTopic: async (_client, radarTopic) => calls.push(['topic', radarTopic.slug]),
      createRadarRun: async (_client, { topicSlug }) => {
        calls.push(['run', topicSlug])
        return nextRunId++
      },
      upsertRadarItems: async (_client, { items }) => {
        calls.push(['items', items[0].topicSlug])
        return [7]
      },
      upsertRadarPulse: async (_client, { pulse }) => calls.push(['pulse', pulse.date]),
      finishRadarRun: async (_client, payload) => calls.push(['finish', payload.status]),
    }

    const results = await runRadar({
      topicSlug: 'mobile-ai',
      client: {},
      adapter: async ({ topic: radarTopic }) => {
        const nextAttempt = (attempts.get(radarTopic.slug) || 0) + 1
        attempts.set(radarTopic.slug, nextAttempt)
        if (nextAttempt === 1) throw new Error('transient source failure')
        return {
          report: {
            ...report,
            ranked_candidates: [{
              candidate_id: 'c1',
              item_id: `item-${radarTopic.slug}`,
              source: 'reddit',
              title: `${radarTopic.name} signal`,
              url: `https://example.com/${radarTopic.slug}`,
              snippet: 'Snippet',
              final_score: 90,
              cluster_id: 'c1',
              source_items: [],
            }],
          },
          stderr: '',
          command: [],
        }
      },
      repository,
    })

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      topicSlug: 'mobile-ai',
      status: 'completed',
      attempts: 2,
    })
    expect(attempts.get('mobile-ai')).toBe(2)
    expect(calls).toContainEqual(['finish', 'failed'])
    expect(calls).toContainEqual(['finish', 'completed'])
  })

  it('continues after a topic fails', async () => {
    const calls = []
    const repository = {
      upsertRadarTopic: async (_client, radarTopic) => calls.push(['topic', radarTopic.slug]),
      createRadarRun: async (_client, { topicSlug }) => {
        calls.push(['run', topicSlug])
        return topicSlug === 'mobile-ai' ? 1 : 2
      },
      upsertRadarItems: async (_client, { items }) => {
        calls.push(['items', items[0].topicSlug])
        return [7]
      },
      upsertRadarPulse: async (_client, { pulse }) => calls.push(['pulse', pulse.date]),
      finishRadarRun: async (_client, payload) => calls.push(['finish', payload.status]),
    }

    const results = await runRadar({
      cadence: 'daily',
      client: {},
      adapter: async ({ topic: radarTopic }) => {
        if (radarTopic.slug === 'mobile-ai') throw new Error('first failed')
        return {
          report: {
            ...report,
            ranked_candidates: [{
              candidate_id: 'c1',
              item_id: `item-${radarTopic.slug}`,
              source: 'reddit',
              title: `${radarTopic.name} signal`,
              url: `https://example.com/${radarTopic.slug}`,
              snippet: 'Snippet',
              final_score: 90,
              cluster_id: 'c1',
              source_items: [],
            }],
          },
          stderr: '',
          command: [],
        }
      },
      repository,
    })

    expect(results[0]).toMatchObject({
      topicSlug: 'mobile-ai',
      status: 'failed',
      error: 'first failed',
    })
    expect(results.some(result => result.status === 'completed')).toBe(true)
    expect(calls).toContainEqual(['finish', 'failed'])
    expect(calls).toContainEqual(['finish', 'completed'])
  })

  it('creates one daily pulse from all successful topic evidence', async () => {
    let nextRunId = 1
    const pulseWrites = []
    const generatePulse = vi.fn(({ date, items }) => ({
      date,
      pulseText: `Aggregated ${items.length} items`,
      topItemIds: items.map((item) => item.id),
    }))
    const repository = {
      upsertRadarTopic: async () => {},
      createRadarRun: async () => nextRunId++,
      upsertRadarItems: async (_client, { items }) => [items[0].topicSlug.length],
      upsertRadarPulse: async (_client, payload) => pulseWrites.push(payload),
      finishRadarRun: async () => {},
    }

    const results = await runRadar({
      cadence: 'daily',
      client: {},
      repository,
      today: '2026-06-14',
      generatePulse,
      adapter: async ({ topic: radarTopic }) => ({
        report: {
          ...report,
          ranked_candidates: [{
            candidate_id: `candidate-${radarTopic.slug}`,
            item_id: `item-${radarTopic.slug}`,
            source: 'reddit',
            title: `${radarTopic.name} signal`,
            url: `https://example.com/${radarTopic.slug}`,
            snippet: 'Snippet',
            final_score: 90,
            cluster_id: `cluster-${radarTopic.slug}`,
            source_items: [],
          }],
        },
        stderr: '',
        command: [],
      }),
    })

    expect(generatePulse).toHaveBeenCalledTimes(1)
    expect(generatePulse).toHaveBeenCalledWith(expect.objectContaining({
      date: '2026-06-14',
      items: expect.arrayContaining([
        expect.objectContaining({ topicSlug: 'mobile-ai' }),
        expect.objectContaining({ topicSlug: 'consumer-ai-apps' }),
        expect.objectContaining({ topicSlug: 'coding-agents' }),
      ]),
    }))
    expect(pulseWrites).toEqual([
      expect.objectContaining({
        runId: 3,
        pulse: expect.objectContaining({ pulseText: 'Aggregated 3 items' }),
      }),
    ])
    expect(results.every((result) => !('pulseItems' in result))).toBe(true)
  })
})
