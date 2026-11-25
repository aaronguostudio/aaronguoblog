// Import the public projection from GrokBot, never its private editorial feed.
import { createHash, randomUUID } from 'node:crypto'
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { isIP } from 'node:net'
import { pathToFileURL } from 'node:url'
import { sortRadarItemsByDateDesc } from '../../utils/radar-snapshot.ts'
import { getRadarTopics } from '../radar/config.js'

const topics = new Map(getRadarTopics().map(({ slug, name, category }) =>
  [slug, { slug, name, category }],
))
topics.set('general', { slug: 'general', name: 'General', category: 'general' })

function plainText(value) {
  if (typeof value !== 'string' || !value.trim() || /<\/?[a-z][^>]*>/i.test(value)) {
    throw new Error('Expected public plain text')
  }
  return value.trim()
}

function originalLink(value) {
  const url = new URL(value)
  const host = url.hostname.replace(/\.$/, '')
  if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') ||
      isIP(host) || host.includes(':') || /\.(local|internal|localhost)$/.test(host) ||
      /(^|\.)(notion\.(com|so|site)|drive\.google\.com|docs\.google\.com)$/.test(host)) {
    throw new Error('Expected a public HTTPS original')
  }
  return url.href
}

function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\d(?:T.*(?:Z|[+-]\d\d:\d\d))?$/.test(value) ||
      !Number.isFinite(Date.parse(value))) throw new Error('Invalid Radar timestamp')
  return new Date(value).toISOString()
}

export function publicSnapshot(feed, previous) {
  if (feed.schema_version !== 1 || !Array.isArray(feed.items) || !feed.items.length) {
    throw new Error('Expected a nonempty public Radar export')
  }
  const generatedAt = timestamp(feed.generated_at)
  if (previous && Date.parse(generatedAt) < Date.parse(previous.generatedAt)) {
    throw new Error('Older Radar export; keeping the current snapshot')
  }

  const byUrl = new Map()
  for (const record of feed.items) {
    const url = originalLink(record.url)
    const topic = topics.get(record.topic)
    if (!topic) throw new Error('Unknown Radar topic')
    const publishedAt = timestamp(record.published_at)
    const item = {
      id: createHash('sha256').update(url).digest('hex').slice(0, 24),
      title: plainText(record.title), url, source: plainText(record.source),
      publishedAt, category: topic.category, topicSlug: topic.slug,
    }
    if (!byUrl.has(url)) byUrl.set(url, item)
  }
  const items = sortRadarItemsByDateDesc([...byUrl.values()])
  const counts = new Map()
  for (const item of items) counts.set(item.source, (counts.get(item.source) || 0) + 1)
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton' }).format(new Date(generatedAt))
  const usedTopics = new Set(items.map(item => item.topicSlug))
  return {
    version: 1, producer: 'grokbot', date, generatedAt,
    latestRun: { completedAt: generatedAt },
    topics: [...topics.values()].filter(topic => usedTopics.has(topic.slug)),
    stats: [...counts].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
    items,
    // The historical thread cards link to these already-published research notes.
    deepReads: previous?.deepReads || [],
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2]
  if (!path) throw new Error('Pass a downloaded radar-public.json file')
  const target = new URL('../../public/radar/latest.json', import.meta.url)
  const previous = JSON.parse(await readFile(target, 'utf8'))
  const snapshot = publicSnapshot(JSON.parse(await readFile(path, 'utf8')), previous)
  const contents = JSON.stringify(snapshot, null, 2) + '\n'
  if (previous.producer === 'grokbot' && previous.generatedAt === snapshot.generatedAt &&
      JSON.stringify(previous) !== JSON.stringify(snapshot)) throw new Error('Conflicting export at the same timestamp')
  const staging = new URL('radar-' + randomUUID() + '.tmp', target)
  try {
    await writeFile(staging, contents, { flag: 'wx' })
    await rename(staging, target)
  } finally {
    await rm(staging, { force: true })
  }
  console.log(snapshot.generatedAt, snapshot.items.length, 'public items')
}
