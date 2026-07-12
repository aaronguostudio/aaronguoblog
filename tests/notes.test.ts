import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  formatNoteDate,
  formatNoteNumber,
  getNoteRoute,
  getNoteSlug,
  prepareNotes,
} from '../utils/notes'

const root = process.cwd()

describe('note routing', () => {
  it('normalizes English and Chinese content paths to the same public route', () => {
    expect(getNoteSlug('/notes/rest-is-part-of-the-ai-stack')).toBe(
      'rest-is-part-of-the-ai-stack',
    )
    expect(getNoteSlug('/zh/notes/rest-is-part-of-the-ai-stack')).toBe(
      'rest-is-part-of-the-ai-stack',
    )
    expect(getNoteRoute('/zh/notes/rest-is-part-of-the-ai-stack')).toBe(
      '/notes/rest-is-part-of-the-ai-stack',
    )
  })

  it('formats stable note numbers', () => {
    expect(formatNoteNumber(4)).toBe('04')
    expect(formatNoteNumber(undefined, 8)).toBe('09')
  })

  it('formats date-only values without shifting the calendar day', () => {
    expect(formatNoteDate('2026-07-10', 'en-US')).toBe('July 10, 2026')
    expect(formatNoteDate('2026-07-10', 'zh-CN')).toBe('2026年7月10日')
  })
})

describe('note preparation', () => {
  const items = [
    {
      path: '/notes/newer',
      title: 'Newer',
      date: '2026-07-10',
      summary: 'Newer summary',
      hook: 'Newer hook',
      published: true,
    },
    {
      path: '/notes/draft',
      title: 'Draft',
      date: '2026-07-11',
      summary: 'Draft summary',
      hook: 'Draft hook',
      published: false,
    },
    {
      path: '/notes/older',
      title: 'Older',
      date: '2026-06-01',
      summary: 'Older summary',
      hook: 'Older hook',
      published: true,
    },
  ]

  it('filters drafts and sorts newest first by default', () => {
    expect(prepareNotes(items).map((note) => note.title)).toEqual(['Newer', 'Older'])
  })

  it('can include drafts for local preview', () => {
    expect(prepareNotes(items, { includeDrafts: true }).map((note) => note.title)).toEqual([
      'Draft',
      'Newer',
      'Older',
    ])
  })
})

describe('Builder Notes surface', () => {
  it('defines localized collections with public route prefixes', () => {
    const config = readFileSync(join(root, 'content.config.ts'), 'utf8')

    expect(config).toContain("source: { include: 'notes/en/*.md', prefix: '/notes' }")
    expect(config).toContain("source: { include: 'notes/zh/*.md', prefix: '/zh/notes' }")
  })

  it('ships a paired bilingual first note', () => {
    const english = readFileSync(
      join(root, 'content', 'notes', 'en', 'rest-is-part-of-the-ai-stack.md'),
      'utf8',
    )
    const chinese = readFileSync(
      join(root, 'content', 'notes', 'zh', 'rest-is-part-of-the-ai-stack.md'),
      'utf8',
    )

    expect(english).toContain("translationKey: 'rest-is-part-of-the-ai-stack'")
    expect(chinese).toContain("translationKey: 'rest-is-part-of-the-ai-stack'")
    expect(english).toContain('published: true')
    expect(chinese).toContain('published: true')
  })

  it('connects the archive, detail page, homepage, and social metadata', () => {
    const indexPage = readFileSync(join(root, 'pages', 'notes', 'index.vue'), 'utf8')
    const detailPage = readFileSync(join(root, 'pages', 'notes', '[slug].vue'), 'utf8')
    const homePage = readFileSync(join(root, 'pages', 'index.vue'), 'utf8')

    expect(indexPage).toContain("queryCollection('notesEn')")
    expect(indexPage).toContain("queryCollection('notesZh')")
    expect(detailPage).toContain('.path(normalizedRoutePath.value)')
    expect(detailPage).toContain('<ContentRenderer')
    expect(detailPage).toContain("type: 'article'")
    expect(detailPage).toContain('image: socialImage.value')
    expect(detailPage).not.toContain('defineOgImageComponent')
    expect(homePage).toContain('<MainNotes />')
  })

  it('supports optional, responsive WebP note images', () => {
    const config = readFileSync(join(root, 'content.config.ts'), 'utf8')
    const homeNotes = readFileSync(join(root, 'components', 'main', 'notes.vue'), 'utf8')
    const archiveCard = readFileSync(join(root, 'components', 'notes', 'Card.vue'), 'utf8')
    const detailPage = readFileSync(join(root, 'pages', 'notes', '[slug].vue'), 'utf8')

    expect(config).toContain('image: z.string().optional()')
    expect(config).toContain('alt: z.string().optional()')
    expect(homeNotes).toContain('format="webp"')
    expect(archiveCard).toContain('quality="82"')
    expect(detailPage).toContain('preload')
  })

  it('uses a larger desktop image panel and a motion-safe mobile note carousel', () => {
    const homeNotes = readFileSync(join(root, 'components', 'main', 'notes.vue'), 'utf8')

    expect(homeNotes).toContain(".slice(0, 5)")
    expect(homeNotes).toContain("grid-cols-[minmax(0,1fr)_minmax(9.5rem,0.52fr)]")
    expect(homeNotes).toContain('aspect-[4/3]')
    expect(homeNotes).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')")
    expect(homeNotes).toContain('aria-roledescription="carousel"')
    expect(homeNotes).toContain('@touchend.passive="handleTouchEnd"')
    expect(homeNotes).toContain("window.setInterval")
  })

  it('preserves the featured writing cover aspect ratio on the homepage', () => {
    const writing = readFileSync(join(root, 'components', 'main', 'writing.vue'), 'utf8')

    expect(writing).toContain('aspect-video w-full object-cover')
    expect(writing).not.toContain('lg:h-[360px]')
    expect(writing).toContain('class="group flex h-full"')
    expect(writing).toContain('min-h-[6.75rem] flex-1 flex-col justify-between p-4')
  })
})
