import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { importRadar, publicSnapshot } from '../scripts/signal/import-radar.mjs'
import { enrichRadarItems, imageFromHead } from '../scripts/signal/radar-enrichment.mjs'

const item = {
  url: 'https://example.org/research', source: 'Example Lab',
  title: 'Research note', published_at: '2026-11-24', topic: 'coding-agents',
  privateNote: 'personal reading notes',
}
const feed = { schema_version: 1, generated_at: '2026-11-25T02:00:00Z', items: [item, item] }

describe('GrokBot Radar import', () => {
  it('normalizes v1 identity, deduplicates links and excludes private fields', () => {
    const result = publicSnapshot({
      ...feed,
      items: [{ ...item, url: 'https://EXAMPLE.org:443/research/?utm_source=x#part' }, item],
    })
    const id = createHash('sha1').update(item.url).digest('hex').slice(0, 16)
    expect(result.items).toEqual([{
      id, url: 'https://example.org/research/?utm_source=x#part',
      title: { en: item.title, zh: item.title, original: item.title },
      lang: 'en', topic: item.topic, source: item.source, published_at: '2026-11-24T00:00:00.000Z',
    }])
    expect(result.date).toBe('2026-11-24')
    expect(result.stats).toEqual([{ source: 'Example Lab', count: 1 }])
    expect(result.topics).toMatchObject([{ slug: item.topic, category: 'coding' }])
  })

  it('rejects stale, conflicting, empty, and private exports', () => {
    expect(() => publicSnapshot(feed, { generatedAt: '2026-11-26T00:00:00Z' })).toThrow(/Older/)
    expect(() => publicSnapshot({ ...feed, items: [] })).toThrow(/nonempty/)
    expect(() => publicSnapshot({ ...feed, items: [{ ...item, url: 'https://drive.google.com/a' }] })).toThrow(/public/)
    expect(() => publicSnapshot({ ...feed, items: [{ ...item, title: 'Conflict' }] }, publicSnapshot(feed)))
      .toThrow(/Conflicting/)
    expect(() => publicSnapshot({ ...feed, schema_version: 2 })).toThrow()
  })

  it('imports both versions, reuses persisted caches, and retries only eligible entries', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'signal-radar-'))
    const root = pathToFileURL(directory + sep)
    const titleCachePath = new URL('title-cache.json', root)
    const options = {
      target: new URL('latest.json', root), titleCachePath, imageCachePath: new URL('image-cache.json', root),
      apiKey: 'test-key', now: Date.parse('2026-11-26T00:00:00Z'),
      fetchImpl: vi.fn(async (_url, init) => {
        const tasks = JSON.parse(JSON.parse(init.body).messages[1].content)
        return Response.json({ choices: [{ message: { content: JSON.stringify({
          items: tasks.map(task => ({
            id: task.id,
            ...Object.fromEntries(task.targets.map(lang => [lang, `${lang}: ${task.title}`])),
          })),
        }) } }] })
      }),
      findImageImpl: vi.fn(async (url: string) => {
        if (url.endsWith('/ko')) throw new Error('Network failure')
        return url.endsWith('/ja') ? 'https://cdn.example.org/ja.png' : null
      }),
    }
    const japanese = {
      ...item, id: 'jp-1', lang: 'ja', url: 'https://example.org/ja', title: '新しい実験の結果',
    }
    const chinese = {
      ...item, id: 'zh-1', lang: 'zh', url: 'https://example.org/zh', title: '新的实验结果',
      image: 'https://cdn.example.org/zh.png',
    }
    const korean = {
      ...item, id: 'ko-1', lang: 'ko', url: 'https://example.org/ko', title: '새로운 실험 결과',
    }
    try {
      const v1 = await importRadar(feed, options)
      expect(v1.requests).toEqual({ translation: 1, image: 1 })
      expect(v1.snapshot.items[0].title).toEqual({ en: item.title, zh: 'zh: Research note', original: item.title })
      expect((await importRadar(feed, options)).requests).toEqual({ translation: 0, image: 0 })

      const v2 = {
        ...feed, schema_version: 2, generated_at: '2026-11-26T00:00:00Z',
        items: [japanese, chinese, korean, { ...item, id: v1.snapshot.items[0].id, lang: 'en' }],
      }
      const firstV2 = await importRadar(v2, options)
      expect(firstV2.requests).toEqual({ translation: 1, image: 2 })
      expect(firstV2.snapshot.items.find(row => row.id === japanese.id)).toMatchObject({
        title: { en: 'en: 新しい実験の結果', zh: 'zh: 新しい実験の結果', original: japanese.title },
        image: 'https://cdn.example.org/ja.png',
      })
      expect(firstV2.snapshot.items.find(row => row.id === chinese.id)?.title.zh).toBe(chinese.title)
      expect(firstV2.snapshot.items.find(row => row.id === korean.id)).not.toHaveProperty('image')
      expect((await importRadar(v2, options)).requests).toEqual({ translation: 0, image: 0 })
      expect(options.fetchImpl).toHaveBeenCalledTimes(2)
      expect(options.findImageImpl).toHaveBeenCalledTimes(3)
      const tasks = JSON.parse(JSON.parse(options.fetchImpl.mock.calls[1][1].body).messages[1].content)
      expect(tasks).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'jp-1', targets: ['en', 'zh'] }),
        expect.objectContaining({ id: 'zh-1', targets: ['en'] }),
        expect.objectContaining({ id: 'ko-1', targets: ['en', 'zh'] }),
      ]))

      const revised = { ...v2, generated_at: '2026-11-27T00:00:00Z', items: [
        { ...japanese, title: '失敗した実験' }, ...v2.items.slice(1),
      ] }
      options.fetchImpl.mockRejectedValueOnce(new Error('Provider unavailable'))
      const failed = await importRadar(revised, options)
      expect(failed.requests).toEqual({ translation: 1, image: 0 })
      const fallback = failed.snapshot.items.find(row => row.id === japanese.id)?.title
      expect(fallback).toEqual({ en: '失敗した実験', zh: '失敗した実験', original: '失敗した実験' })
      expect((await importRadar(revised, options)).requests).toEqual({ translation: 0, image: 0 })
      const cache = JSON.parse(await readFile(titleCachePath, 'utf8'))
      expect(cache['jp-1']).toMatchObject({
        en: null, zh: null, src_lang: 'ja',
        title_hash: createHash('sha256').update('失敗した実験').digest('hex'),
      })

      const retry = await importRadar(revised, { ...options, now: options.now + 7 * 86_400_000 })
      expect(retry.requests).toEqual({ translation: 0, image: 2 })
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('limits translation batch size and concurrent image lookups', async () => {
    const items = Array.from({ length: 21 }, (_, index) => ({
      id: String(index), url: `https://example.org/${index}`, lang: 'en',
      title: { en: item.title, zh: item.title, original: item.title },
    }))
    const sizes: number[] = []
    let active = 0
    let peak = 0
    const requests = await enrichRadarItems(items, new Map(), new Map(), {
      apiKey: 'test-key',
      fetchImpl: async (_url, init) => {
        sizes.push(JSON.parse(JSON.parse(init.body).messages[1].content).length)
        return Response.json({ choices: [{ message: { content: '{"items":[]}' } }] })
      },
      findImageImpl: async () => {
        peak = Math.max(peak, ++active)
        await Promise.resolve()
        active--
        return null
      },
    })
    expect(sizes).toEqual([20, 1])
    expect(peak).toBe(4)
    expect(requests).toEqual({ translation: 2, image: 21 })
  })

  it('prefers HTTPS Open Graph metadata and falls back to Twitter metadata', () => {
    const url = 'https://news.example.org/posts/today'
    const twitter = '<meta content="/social.png?file=cover&amp;size=64" name="twitter:image">'
    const og = '<meta property="og:image" content="//img.example.org/cover.png">'
    expect(imageFromHead(`<head>${twitter}${og}</head>`, url)).toBe('https://img.example.org/cover.png')
    expect(imageFromHead(`<head>${twitter}<meta property="og:image" content="http://img.example.org/cover.png"></head>`, url))
      .toBe('https://news.example.org/social.png?file=cover&size=64')
    expect(imageFromHead(`<head><!-- ${og} --></head><body>${og}</body>`, url)).toBeNull()
  })
})
