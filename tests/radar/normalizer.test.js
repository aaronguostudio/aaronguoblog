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
      relevance: 8,
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
})
