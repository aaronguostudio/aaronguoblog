import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { normalizeLast30DaysReport } from '../../scripts/radar/normalizer.js'

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), 'tests/fixtures/last30days-mobile-ai.json'), 'utf8')
)

const topic = {
  slug: 'mobile-ai',
  name: 'Mobile AI',
  category: 'ai',
  minRelevance: 5,
}

describe('normalizeLast30DaysReport', () => {
  it('converts ranked candidates into Radar item inputs', () => {
    const items = normalizeLast30DaysReport({ report: fixture, topic })

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      canonicalUrl: 'https://www.reddit.com/r/LocalLLaMA/comments/mobile_ai',
      source: 'reddit',
      sourceItemId: 'reddit-1',
      url: 'https://www.reddit.com/r/LocalLLaMA/comments/mobile_ai/?utm_source=share#comments',
      title: 'People are replacing simple phone workflows with local AI assistants',
      summary: 'Users describe local assistants handling voice notes and app actions.',
      aiSummary: 'A concrete thread about on-device mobile assistants replacing small daily workflows.',
      author: 'localbuilder',
      score: 128,
      relevance: 9,
      category: 'ai',
      topicSlug: 'mobile-ai',
      clusterId: 'cluster-on-device',
      clusterTitle: 'On-device assistants move from demos to daily workflows',
      publishedAt: '2026-06-13T09:30:00Z',
    })
  })

  it('drops candidates with missing urls', () => {
    const report = {
      ...fixture,
      ranked_candidates: [{ ...fixture.ranked_candidates[0], url: '', source_items: [] }],
    }

    expect(normalizeLast30DaysReport({ report, topic })).toEqual([])
  })

  it('uses the strongest normalized relevance signal', () => {
    const report = {
      ...fixture,
      ranked_candidates: [
        {
          ...fixture.ranked_candidates[0],
          final_score: 10,
          rerank_score: 0.93,
          local_relevance: 0.87,
        },
      ],
    }

    const items = normalizeLast30DaysReport({ report, topic })

    expect(items[0].relevance).toBe(9)
  })

  it('stores compact raw trace data instead of the full candidate payload', () => {
    const items = normalizeLast30DaysReport({ report: fixture, topic })

    expect(items[0].raw.candidate).toBeUndefined()
    expect(items[0].raw).toMatchObject({
      candidateId: 'candidate-1',
      itemId: 'reddit-1',
      source: 'reddit',
      sources: ['reddit'],
      subqueryLabels: ['mobile-ai'],
      finalScore: 84,
      rerankScore: 0.88,
      localRelevance: 0.91,
      freshness: 9,
      engagement: 128,
      sourceQuality: 0.82,
      rrfScore: 0.12,
      rangeFrom: '2026-05-15',
      rangeTo: '2026-06-14',
      generatedAt: '2026-06-14T14:00:00Z',
      primaryItem: {
        itemId: 'reddit-1',
        source: 'reddit',
        container: 'r/LocalLLaMA',
        publishedAt: '2026-06-13T09:30:00Z',
        dateConfidence: 'high',
        engagement: { score: 128, comments: 34 },
      },
    })
  })
})
