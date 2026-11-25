// node scripts/signal/import-edition.mjs /private/signal-feed.json /private/edition.json
// The edition supplies date, a bilingual headline and intro, and an ordered list of
// { id, evidence, title, note }. Each text field has en and zh versions.
// Only editorial copy and the selected public sources are written to the site.
import { readFile, link, writeFile, rm } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'

function bilingual(value) {
  if (['en', 'zh'].some(locale => typeof value?.[locale] !== 'string' || !value[locale].trim())) {
    throw new Error('Each editorial field needs English and Chinese copy')
  }
  return { en: value.en.trim(), zh: value.zh.trim() }
}

function sourceUrl(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password ||
      /(^|\.)(notion\.(com|so|site)|drive\.google\.com|docs\.google\.com)$/.test(url.hostname)) {
    throw new Error('Choose a public HTTPS source')
  }
  return url.href
}

export function buildEdition(feed, edition) {
  if (![2, 3].includes(feed.schema_version) || !Array.isArray(feed.items)) {
    throw new Error('Expected a v2 or v3 Signal feed')
  }
  const date = new Date(edition.date + 'T12:00:00Z')
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== edition.date) {
    throw new Error('Expected a calendar date for the edition')
  }
  if (!Array.isArray(edition.items) || edition.items.length !== 3) throw new Error('Select exactly three picks')
  const cover = edition.cover ?? 'atlas'
  if (!['atlas', 'eclipse', 'fieldnotes', 'aurora'].includes(cover)) throw new Error('Unknown Signal cover')
  const byId = new Map(feed.items.map(item => [item.id, item]))
  const selected = new Set()
  const items = edition.items.map(pick => {
    const item = byId.get(pick.id)
    if (!item || selected.has(item.id)) throw new Error('Unknown or repeated pick: ' + pick.id)
    selected.add(item.id)
    const discovery = sourceUrl(item.primary_url)
    const evidence = sourceUrl(pick.evidence)
    const attached = [
      discovery,
      ...(item.artifact_links || []),
      ...(item.other_links || []),
      ...(item.corroborating_links || []).map(link => link.url),
    ]
    const hasEvidence = attached.some(link => URL.canParse(link) && new URL(link).href === evidence)
    if (!hasEvidence) {
      throw new Error('Evidence missing from source record: ' + item.id)
    }
    return { id: item.id, title: bilingual(pick.title), note: bilingual(pick.note), evidence, discovery }
  })
  if (!edition.signal) throw new Error('Write the signal derived from the three picks')
  const signal = {
    claim: bilingual(edition.signal.claim),
    reasoning: bilingual(edition.signal.reasoning),
    nextCheck: bilingual(edition.signal.nextCheck),
  }
  return { cover, date: edition.date, headline: bilingual(edition.headline), intro: bilingual(edition.intro), items, signal }
}

// A complete, dated file becomes visible in one operation. Concurrent imports can
// safely add separate dates or retry the same selection without replacing an issue.
export async function saveEdition(result, directory = new URL('../../data/signal/editions/', import.meta.url)) {
  const target = new URL(result.date + '.json', directory)
  const staging = new URL('edition-' + randomUUID() + '.tmp', directory)
  const snapshot = JSON.stringify(result, null, 2) + '\n'
  try {
    await writeFile(staging, snapshot, { flag: 'wx' })
    try {
      await link(staging, target)
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
      if (await readFile(target, 'utf8') !== snapshot) {
        throw new Error('An edition already exists for ' + result.date)
      }
    }
  } finally {
    await rm(staging, { force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [feedPath, editionPath] = process.argv.slice(2)
  if (!feedPath || !editionPath) throw new Error('Pass a private feed file and an editorial selection file')
  const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
  const result = buildEdition(await readJson(feedPath), await readJson(editionPath))
  await saveEdition(result)
}
