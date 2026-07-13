import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('Writing mobile filters', () => {
  const writingPage = readFileSync(join(root, 'pages', 'blogs', 'index.vue'), 'utf8')
  const notesPage = readFileSync(join(root, 'pages', 'notes', 'index.vue'), 'utf8')
  const englishLocale = JSON.parse(readFileSync(join(root, 'i18n', 'locales', 'en-US.json'), 'utf8'))
  const chineseLocale = JSON.parse(readFileSync(join(root, 'i18n', 'locales', 'zh-CN.json'), 'utf8'))

  it('moves category and search controls behind a mobile drawer', () => {
    expect(writingPage).toContain('isMobileFilterPanelOpen')
    expect(writingPage).toContain('activeMobileFilterCount')
    expect(writingPage).toContain('aria-labelledby="mobile-writing-filters-title"')
    expect(writingPage).toContain('role="dialog"')
    expect(writingPage).toContain('hidden pb-8 lg:block')
    expect(writingPage).toContain('hidden lg:col-span-1 lg:block')
  })

  it('keeps mobile filter labels localized', () => {
    expect(englishLocale.blogs.filterAndSearch).toBe('Filter & search')
    expect(englishLocale.blogs.showResults).toBe('Show results')
    expect(chineseLocale.blogs.filterAndSearch).toBe('筛选与搜索')
    expect(chineseLocale.blogs.showResults).toBe('查看结果')
  })

  it('removes the notes published-count badge from the archive header', () => {
    expect(notesPage).not.toContain("t('notes.count'")
    expect(notesPage).not.toContain('notes.length })')
  })
})
