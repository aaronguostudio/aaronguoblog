import { describe, expect, it } from 'vitest'
import { publicSnapshot } from '../scripts/signal/import-radar.mjs'

const item = {
  url: 'https://example.org/research', source: 'Example Lab',
  title: 'Research note', published_at: '2026-11-24', topic: 'coding-agents',
  privateNote: 'personal reading notes',
}
const feed = { schema_version: 1, generated_at: '2026-11-25T02:00:00Z', items: [item, item] }

describe('GrokBot Radar import', () => {
  it('deduplicates public links, keeps the Edmonton date and excludes private fields', () => {
    const result = publicSnapshot(feed)
    expect(result.items).toHaveLength(1)
    expect(result.date).toBe('2026-11-24')
    expect(result.stats).toEqual([{ source: 'Example Lab', count: 1 }])
    expect(result.items[0]).toMatchObject({ title: item.title, category: 'coding', topicSlug: item.topic })
    expect(JSON.stringify(result)).not.toContain(item.privateNote)
  })

  it('rejects stale, empty, and private exports without replacing a good snapshot', () => {
    expect(() => publicSnapshot(feed, { generatedAt: '2026-11-26T00:00:00Z' })).toThrow(/Older/)
    expect(() => publicSnapshot({ ...feed, items: [] })).toThrow(/nonempty/)
    expect(() => publicSnapshot({ ...feed, items: [{ ...item, url: 'https://drive.google.com/a' }] })).toThrow(/public/)
  })
})
