import { describe, expect, it } from 'vitest'
import { buildSignalRadarWhere, mapRadarItemRow } from '../server/utils/signal-radar'

describe('buildSignalRadarWhere', () => {
  it('builds args for filters', () => {
    expect(buildSignalRadarWhere({
      source: 'reddit',
      category: 'ai',
      topic: 'mobile-ai',
      minRelevance: 6,
      search: 'assistant',
    })).toEqual({
      sql: [
        'rit.relevance >= ?',
        'ri.source = ?',
        'rit.category = ?',
        'rit.topic_slug = ?',
        'ri.title LIKE ?',
      ],
      args: [6, 'reddit', 'ai', 'mobile-ai', '%assistant%'],
    })
  })
})

describe('mapRadarItemRow', () => {
  it('maps radar rows to the existing Signal item shape', () => {
    expect(mapRadarItemRow({
      id: 7,
      source: 'reddit',
      url: 'https://example.com',
      title: 'Title',
      summary: 'Summary',
      ai_summary: 'AI',
      author: 'Author',
      score: 12,
      relevance: 8,
      category: 'ai',
      topic_slug: 'mobile-ai',
      created_at: '2026-06-14 12:00:00',
      last_seen_at: '2026-06-14 13:00:00',
    })).toEqual({
      id: 7,
      source: 'reddit',
      url: 'https://example.com',
      title: 'Title',
      summary: 'Summary',
      ai_summary: 'AI',
      author: 'Author',
      score: 12,
      relevance: 8,
      category: 'ai',
      topic_slug: 'mobile-ai',
      created_at: '2026-06-14 13:00:00',
    })
  })
})
