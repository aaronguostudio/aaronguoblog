import { describe, expect, it } from 'vitest'
import { generateRadarPulse } from '../../scripts/radar/pulse.js'

describe('generateRadarPulse', () => {
  it('generates a deterministic concise pulse', () => {
    const pulse = generateRadarPulse({
      date: '2026-06-14',
      items: [
        { id: 7, topicSlug: 'mobile-ai', source: 'reddit', title: 'Mobile AI assistants are moving on-device', relevance: 9, score: 200 },
        { id: 8, topicSlug: 'coding-agents', source: 'github', title: 'Coding agents add repository-level planning', relevance: 8, score: 150 },
        { id: 9, topicSlug: 'mobile-ai', source: 'hackernews', title: 'Developers debate phone-native agents', relevance: 7, score: 80 },
      ],
    })

    expect(pulse).toEqual({
      date: '2026-06-14',
      pulseText: 'Radar found 3 high-signal items across mobile-ai and coding-agents. Top themes: Mobile AI assistants are moving on-device; Coding agents add repository-level planning; Developers debate phone-native agents.',
      topItemIds: [7, 8, 9],
    })
  })

  it('handles empty item sets', () => {
    expect(generateRadarPulse({ date: '2026-06-14', items: [] })).toEqual({
      date: '2026-06-14',
      pulseText: 'Radar did not find enough high-signal items for this run.',
      topItemIds: [],
    })
  })

  it('filters missing IDs and keeps fallback text clean for missing topics and titles', () => {
    const pulse = generateRadarPulse({
      date: '2026-06-14',
      items: [
        { id: undefined, topicSlug: 'mobile-ai', source: 'reddit', title: 'Excluded item with no ID', relevance: 10, score: 500 },
        { id: '', topicSlug: 'coding-agents', source: 'github', title: 'Excluded item with blank ID', relevance: 9, score: 400 },
        { id: 10, topicSlug: '   ', source: 'reddit', title: '   ', clusterTitle: '  Agent activity moved on-device  ', relevance: 8, score: 300 },
        { id: 11, source: 'hackernews', title: '', clusterTitle: ' ', summary: '  Phone-native agents drew developer debate.  ', relevance: 7, score: 200 },
      ],
    })

    expect(pulse).toEqual({
      date: '2026-06-14',
      pulseText: 'Radar found 2 high-signal items across tracked topics. Top themes: Agent activity moved on-device; Phone-native agents drew developer debate.',
      topItemIds: [10, 11],
    })
  })

  it('uses a public fallback sentence when item titles are not descriptive', () => {
    expect(generateRadarPulse({
      date: '2026-06-14',
      items: [
        { id: 12, topicSlug: undefined, source: 'reddit', title: ' ', clusterTitle: '', summary: ' ', relevance: 8, score: 100 },
      ],
    })).toEqual({
      date: '2026-06-14',
      pulseText: 'Radar found activity, but the item titles were not descriptive enough to summarize.',
      topItemIds: [12],
    })
  })

  it('orders ties deterministically by published date, topic, source, and id', () => {
    const pulse = generateRadarPulse({
      date: '2026-06-14',
      items: [
        { id: 21, topicSlug: 'z-topic', source: 'reddit', title: 'Older item', relevance: 8, score: 100, publishedAt: '2026-06-13T12:00:00.000Z' },
        { id: 19, topicSlug: 'a-topic', source: 'github', title: 'Same date later by topic', relevance: 8, score: 100, publishedAt: '2026-06-14T12:00:00.000Z' },
        { id: 18, topicSlug: 'a-topic', source: 'github', title: 'Same source lower id', relevance: 8, score: 100, publishedAt: '2026-06-14T12:00:00.000Z' },
        { id: 20, topicSlug: 'a-topic', source: 'hackernews', title: 'Same topic later by source', relevance: 8, score: 100, publishedAt: '2026-06-14T12:00:00.000Z' },
      ],
    })

    expect(pulse.topItemIds).toEqual([18, 19, 20, 21])
  })
})
