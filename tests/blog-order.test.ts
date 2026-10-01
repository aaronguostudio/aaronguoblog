import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { sortBlogPosts } from '../utils/blog-order'

describe('homepage blog publication order', () => {
  it.each(['en', 'zh'])('puts the later same-day release in the %s hero', (locale) => {
    const posts = ['34.ai-subscription-cloud-bill.md', '35.your-dot-real-work.md'].map((file) => {
      const article = readFileSync(`content/blogs/${locale}/${file}`, 'utf8')
      return {
        sourceId: `${locale}/blogs/${locale}/${file}`,
        date: article.match(/^date:\s*["'](.+?)["']/m)![1],
      }
    })
    expect(sortBlogPosts(posts)[0].sourceId).toContain('35.your-dot-real-work')
    expect(sortBlogPosts([...posts].reverse())).toEqual(sortBlogPosts(posts))
    expect(posts[0].sourceId).toContain('34.ai-subscription-cloud-bill')
  })

  it('keeps date as the primary order even when an older post has a larger number', () => {
    const posts = [
      { sourceId: 'en/blogs/en/99.older.md', date: '29th Sep 2026' },
      { sourceId: 'en/blogs/en/35.newer.md', date: '30th Sep 2026' },
      { sourceId: 'en/blogs/en/9.same-day.md', date: '30th Sep 2026' },
    ]
    expect(sortBlogPosts(posts).map((post) => post.sourceId)).toEqual([
      'en/blogs/en/35.newer.md',
      'en/blogs/en/9.same-day.md',
      'en/blogs/en/99.older.md',
    ])
  })
})
