import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildEdition, requireEditorialCover, saveEdition } from '../scripts/signal/import-edition.mjs'
import { coverImage, signalEditions } from '../data/signal/editions'
import edition from '../data/signal/editions/2026-11-24.json'

const items = edition.items.map(pick => ({
  id: pick.id, primary_url: pick.discovery, other_links: [pick.evidence],
  notion_url: 'https://notion.so/private', why: 'private research notes', status: '新',
}))
const feed = { schema_version: 2, items }

describe('public reading desk', () => {
  it('joins only the selected copy and source links from a private export', () => {
    expect(buildEdition(feed, edition)).toEqual(edition)
  })

  it('recognizes older cover presets and defaults new editions to dated artwork', () => {
    for (const cover of ['editorial', 'atlas', 'eclipse', 'fieldnotes', 'aurora']) {
      expect(buildEdition(feed, { ...edition, cover }).cover).toBe(cover)
    }
    expect(buildEdition(feed, { ...edition, cover: undefined }).cover).toBe('editorial')
    expect(() => buildEdition(feed, { ...edition, cover: 'missing' })).toThrow(/cover/)
  })

  it('requires a dated artwork file when importing a new edition', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'signal-covers-'))
    const directory = pathToFileURL(dir + sep)
    try {
      await expect(requireEditorialCover(edition, directory)).rejects.toThrow(edition.date + '.webp')
      await writeFile(new URL(edition.date + '.webp', directory), await readFile(new URL('../public' + coverImage(edition), import.meta.url)))
      await expect(requireEditorialCover(edition, directory)).resolves.toBeUndefined()
      await expect(requireEditorialCover({ ...edition, cover: 'atlas' }, directory)).rejects.toThrow(/editorial cover/)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('ships a distinct WebP illustration for each date using the editorial cover', async () => {
    const checksums = new Set()
    for (const issue of signalEditions.filter(issue => issue.cover === 'editorial')) {
      const image = await readFile(new URL('../public' + coverImage(issue), import.meta.url))
      expect(image.toString('ascii', 8, 12)).toBe('WEBP')
      const checksum = createHash('sha256').update(image).digest('hex')
      expect(checksums.has(checksum)).toBe(false)
      checksums.add(checksum)
    }
  })

  it('reads artifact links from the compact Drive export', () => {
    const compact = items.map(({ other_links, ...item }) => ({ ...item, artifact_links: other_links }))
    expect(buildEdition({ schema_version: 3, items: compact }, edition)).toEqual(edition)
  })

  it('rejects missing evidence, missing translations and impossible dates', () => {
    expect(() => buildEdition({ ...feed, items: [] }, edition)).toThrow(/Unknown/)
    expect(() => buildEdition(feed, { ...edition, items: [{ ...edition.items[0], evidence: 'https://example.org/' }, ...edition.items.slice(1)] })).toThrow(/Evidence/)
    expect(() => buildEdition(feed, { ...edition, headline: { en: 'Title' } })).toThrow(/English and Chinese/)
    expect(() => buildEdition(feed, { ...edition, date: '2026-02-30' })).toThrow(/calendar date/)
  })

  it('rejects a private archive link even when attached to a selected record', () => {
    const privateUrl = 'https://drive.google.com/file/d/private/view'
    const record = { ...items[0], other_links: [privateUrl] }
    const selection = { ...edition.items[0], evidence: privateUrl }
    expect(() => buildEdition({ ...feed, items: [record] }, { ...edition, items: [selection, ...edition.items.slice(1)] })).toThrow(/public HTTPS/)
  })

  it('requires exactly three distinct picks', () => {
    for (const picks of [[], items.slice(0, 2), [...items, items[0]]]) {
      expect(() => buildEdition(feed, { ...edition, items: picks })).toThrow(/exactly three/)
    }
    expect(() => buildEdition(feed, { ...edition, items: edition.items.map(() => edition.items[0]) })).toThrow(/repeated/)
  })

  it('requires a bilingual judgment and next check and strips private editorial fields', () => {
    expect(() => buildEdition(feed, { ...edition, signal: undefined })).toThrow(/signal/)
    expect(() => buildEdition(feed, { ...edition, signal: { ...edition.signal, nextCheck: {} } })).toThrow(/English and Chinese/)
    const selection = { ...edition, signal: { ...edition.signal, privateNotes: 'editor only' } }
    expect(buildEdition(feed, selection).signal).toEqual(edition.signal)
  })

  it('retains independent date snapshots and prevents conflicting retries', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'signal-editions-'))
    const directory = pathToFileURL(dir + sep)
    const next = { ...edition, date: '2026-11-25', cover: 'aurora' }
    try {
      await Promise.all([saveEdition(next, directory), saveEdition(edition, directory), saveEdition(edition, directory)])
      await expect(saveEdition({ ...edition, cover: 'eclipse' }, directory)).rejects.toThrow(/already exists/)
      expect((await readdir(dir)).sort()).toEqual([edition.date + '.json', next.date + '.json'])
      expect(JSON.parse(await readFile(join(dir, edition.date + '.json'), 'utf8'))).toEqual(edition)
      expect(JSON.parse(await readFile(join(dir, next.date + '.json'), 'utf8'))).toEqual(next)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
