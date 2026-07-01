import { describe, expect, it } from 'vitest'
import {
  buildPulseItemsQuery,
  buildRadarCountSql,
  buildRadarItemsSql,
  buildRadarStatsSql,
  buildSignalRadarWhere,
  mapRadarItemRow,
} from '../server/utils/signal-radar'

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

describe('radar feed SQL', () => {
  it('dedupes item rows with ranked topic memberships', () => {
    const sql = buildRadarItemsSql(['rit.relevance >= ?', 'ri.source = ?'])

    expect(sql).toContain('ROW_NUMBER() OVER (PARTITION BY ri.id')
    expect(sql).toContain('ORDER BY rit.last_seen_at DESC, rit.relevance DESC, rit.score DESC, rit.topic_slug ASC')
    expect(sql).toContain('ORDER BY ranked.last_seen_at DESC, ranked.relevance DESC, ranked.score DESC, ranked.id DESC')
    expect(sql).toContain('WHERE ranked.rn = 1')
    expect(sql).toContain('WHERE rit.relevance >= ? AND ri.source = ?')
  })

  it('counts deduped item rows and keeps stats distinct', () => {
    const countSql = buildRadarCountSql(['rit.relevance >= ?'])
    const statsSql = buildRadarStatsSql()

    expect(countSql).toContain('ROW_NUMBER() OVER (PARTITION BY ri.id')
    expect(countSql).toContain('WHERE ranked.rn = 1')
    expect(statsSql).toContain('COUNT(DISTINCT ri.id) as count')
  })
})

describe('buildPulseItemsQuery', () => {
  it('preserves pulse item order and dedupes topic memberships', () => {
    const query = buildPulseItemsQuery([7, 3, 9])

    expect(query.args).toEqual([7, 0, 3, 1, 9, 2])
    expect(query.sql).toContain('WITH pulse_ids(id, position) AS (VALUES (?, ?), (?, ?), (?, ?))')
    expect(query.sql).toContain('ROW_NUMBER() OVER (PARTITION BY ri.id')
    expect(query.sql).toContain('WHERE ranked.rn = 1')
    expect(query.sql).toContain('ORDER BY ranked.position')
  })
})
