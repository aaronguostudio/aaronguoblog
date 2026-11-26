// Import the public projection from GrokBot.
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { sortRadarItemsByDateDesc } from '../../utils/radar-snapshot.ts'
import { getRadarTopics } from '../radar/config.js'
import { enrichRadarItems, publicHttpsUrl } from './radar-enrichment.mjs'

const topics = new Map(getRadarTopics().map(({ slug, name, category }) =>
  [slug, { slug, name, category }],
))
topics.set('general', { slug: 'general', name: 'General', category: 'general' })

const languages = new Set(['en', 'zh', 'ja', 'ko', 'other'])
const targetFile = new URL('../../public/radar/latest.json', import.meta.url)
const titleCacheFile = new URL('../../data/signal/title-cache.json', import.meta.url)
const imageCacheFile = new URL('../../data/signal/image-cache.json', import.meta.url)

function plainText(value) {
  if (typeof value !== 'string' || !value.trim() || /<\/?[a-z][^>]*>/i.test(value)) {
    throw new Error('Expected public plain text')
  }
  return value.trim()
}

function originalLink(value) {
  const url = publicHttpsUrl(value)
  if (!url || /(^|\.)(notion\.(com|so|site)|drive\.google\.com|docs\.google\.com)$/.test(url.hostname.replace(/\.$/, ''))) {
    throw new Error('Expected a public HTTPS original')
  }
  return url.href
}

function normalizedUrl(value) {
  const url = new URL(value)
  url.hostname = url.hostname.replace(/\.$/, '')
  url.hash = ''
  url.pathname = url.pathname.replace(/\/+$/, '') || '/'
  for (const key of new Set(url.searchParams.keys())) {
    if (/^(utm_.+|fbclid|gclid|msclkid)$/i.test(key)) url.searchParams.delete(key)
  }
  url.searchParams.sort()
  return url.href
}

function recordLanguage(lang, title, version) {
  if (languages.has(lang)) return lang
  if (version === 2 || lang != null) throw new Error('Invalid Radar language')
  if (/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(title)) return 'ja'
  if (/\p{Script=Hangul}/u.test(title)) return 'ko'
  if (/\p{Script=Han}/u.test(title)) return 'zh'
  const letters = title.match(/\p{L}/gu) || []
  return letters.length && letters.every(letter => /\p{Script=Latin}/u.test(letter)) ? 'en' : 'other'
}

function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\d(?:T.*(?:Z|[+-]\d\d:\d\d))?$/.test(value) ||
      !Number.isFinite(Date.parse(value))) throw new Error('Invalid Radar timestamp')
  return new Date(value).toISOString()
}

function sourceSignature(items, legacy = false) {
  return JSON.stringify(items.map(item => [
    normalizedUrl(item.url),
    legacy ? undefined : item.id,
    legacy ? undefined : item.lang,
    typeof item.title === 'string' ? item.title : item.title.original,
    item.source,
    item.topic ?? item.topicSlug,
    item.published_at ?? item.publishedAt,
  ]).sort((a, b) => a[0].localeCompare(b[0])))
}

export function publicSnapshot(feed, previous) {
  if (![1, 2].includes(feed?.schema_version) || !Array.isArray(feed.items) || !feed.items.length) {
    throw new Error('Expected a nonempty public Radar v1 or v2 export')
  }
  const generatedAt = timestamp(feed.generated_at)
  if (previous && Date.parse(generatedAt) < Date.parse(previous.generatedAt)) {
    throw new Error('Older Radar export; keeping the current snapshot')
  }

  const byUrl = new Map()
  const urlById = new Map()
  for (const record of feed.items) {
    const url = originalLink(record.url)
    const canonicalUrl = normalizedUrl(url)
    const topic = topics.get(record.topic)
    if (!topic) throw new Error('Unknown Radar topic')
    const id = feed.schema_version === 1 && record.id == null
      ? createHash('sha1').update(canonicalUrl).digest('hex').slice(0, 16)
      : plainText(record.id)
    const original = plainText(record.title)
    const lang = recordLanguage(record.lang, original, feed.schema_version)
    const image = publicHttpsUrl(record.image)?.href
    const item = {
      id, title: { en: original, zh: original, original }, lang, url,
      source: plainText(record.source), topic: topic.slug,
      published_at: timestamp(record.published_at),
      ...(image && { image }),
    }

    if (urlById.has(id) && urlById.get(id) !== canonicalUrl) throw new Error('Duplicate Radar id')
    urlById.set(id, canonicalUrl)
    if (!byUrl.has(canonicalUrl)) byUrl.set(canonicalUrl, item)
  }
  const items = sortRadarItemsByDateDesc([...byUrl.values()])
  if (previous?.producer === 'grokbot' && previous.generatedAt === generatedAt) {
    const legacy = previous.version === 1
    if (sourceSignature(previous.items, legacy) !== sourceSignature(items, legacy)) {
      throw new Error('Conflicting export at the same timestamp')
    }
  }
  const counts = new Map()
  for (const item of items) counts.set(item.source, (counts.get(item.source) || 0) + 1)
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton' }).format(new Date(generatedAt))
  const usedTopics = new Set(items.map(item => item.topic))
  return {
    version: 2, producer: 'grokbot', date, generatedAt,
    latestRun: { completedAt: generatedAt },
    topics: [...topics.values()].filter(topic => usedTopics.has(topic.slug)),
    stats: [...counts].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
    items,
    // The historical thread cards link to these already-published research notes.
    deepReads: previous?.deepReads || [],
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return fallback
  }
}

function sortedCache(cache) {
  const ids = [...cache.keys()].sort()
  return Object.fromEntries(ids.map(id => [id, cache.get(id)]))
}

async function writeJson(file, data) {
  const staging = new URL(`.${randomUUID()}.tmp`, file)
  try {
    await writeFile(staging, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' })
    await rename(staging, file)
  } finally {
    await rm(staging, { force: true })
  }
}

export async function importRadar(feed, {
  target = targetFile,
  titleCachePath = titleCacheFile,
  imageCachePath = imageCacheFile,
  ...enrichmentOptions
} = {}) {
  const lockPath = new URL('.import-radar.lock', target)
  const lock = await open(lockPath, 'wx')
  try {
    const previous = await readJson(target, null)
    const snapshot = publicSnapshot(feed, previous)
    const titleCache = new Map(Object.entries(await readJson(titleCachePath, {})))
    const imageCache = new Map(Object.entries(await readJson(imageCachePath, {})))
    const requests = await enrichRadarItems(snapshot.items, titleCache, imageCache, enrichmentOptions)

    await mkdir(new URL('.', titleCachePath), { recursive: true })
    await mkdir(new URL('.', imageCachePath), { recursive: true })
    // Persist enrichment first so a retry after a failed snapshot write can reuse it.
    await writeJson(titleCachePath, sortedCache(titleCache))
    await writeJson(imageCachePath, sortedCache(imageCache))
    await writeJson(target, snapshot)
    return { snapshot, requests }
  } finally {
    await lock.close()
    await rm(lockPath, { force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2]
  if (!path) throw new Error('Pass a downloaded radar-public.json file')
  const { snapshot, requests } = await importRadar(JSON.parse(await readFile(path, 'utf8')))
  console.log(`${snapshot.generatedAt} · ${snapshot.items.length} public items · ${requests.translation} translation batches · ${requests.image} image lookups`)
}
