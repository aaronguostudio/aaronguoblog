import { describe, expect, it } from 'vitest'
import {
  BLOG_CATEGORIES,
  createCategoryCounts,
  getBlogCategories,
  getBlogCategoryLabel,
  normalizeBlogCategoryId,
} from '../utils/blog-taxonomy'

describe('blog taxonomy', () => {
  it('exposes a stable reader-facing category list', () => {
    expect(BLOG_CATEGORIES.map((category) => category.id)).toEqual([
      'ai-native-systems',
      'product-execution',
      'business-strategy',
      'personal-operating-system',
      'creation-media',
    ])
  })

  it('normalizes category ids for route and query params', () => {
    expect(normalizeBlogCategoryId('AI Native Systems')).toBe('ai-native-systems')
    expect(normalizeBlogCategoryId('unknown-topic')).toBeNull()
  })

  it('reads category metadata without leaking tags into navigation', () => {
    expect(
      getBlogCategories({
        category: 'ai-native-systems',
        tags: ['ai', 'mcp', 'agents'],
      }),
    ).toEqual(['ai-native-systems'])
  })

  it('uses category when categories is an empty extracted frontmatter array', () => {
    expect(
      getBlogCategories({
        category: 'business-strategy',
        categories: [],
        tags: ['ai', 'mcp'],
      }),
    ).toEqual(['business-strategy'])
  })

  it('falls back from legacy tags to one canonical category', () => {
    expect(getBlogCategories({ tags: ['ai', 'mcp'] })).toEqual(['ai-native-systems'])
    expect(getBlogCategories({ tags: ['unknown-topic'] })).toEqual([])
  })

  it('counts only canonical categories', () => {
    const counts = createCategoryCounts([
      { category: 'ai-native-systems', tags: ['ai', 'agents'] },
      { categories: ['business-strategy', 'unknown-topic', 'business-strategy'] },
      { tags: ['ai', 'mcp'] },
    ])

    expect([...counts.entries()]).toEqual([
      ['ai-native-systems', 2],
      ['business-strategy', 1],
    ])
    expect(counts.has('ai')).toBe(false)
    expect(counts.has('unknown-topic')).toBe(false)
  })

  it('returns localized labels for display', () => {
    expect(getBlogCategoryLabel('business-strategy', 'en')).toBe('Business Strategy')
    expect(getBlogCategoryLabel('business-strategy', 'zh')).toBe('商业与战略')
  })
})
