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
})
