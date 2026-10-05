import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { sortBlogPosts } from '../utils/blog-order'

describe('blog publication order', () => {
  it.each([
    ['en', '34.ai-subscription-cloud-bill.md', '35.your-dot-real-work.md'],
    ['zh', '34.ai-subscription-cloud-bill.md', '35.your-dot-real-work.md'],
    ['en', '36.gemini-4-argon-output-work.md', '37.karpathy-understanding-ai-output.md'],
    ['zh', '36.gemini-4-argon-output-work.md', '37.karpathy-understanding-ai-output.md'],
  ])('sorts %s releases %s and %s newest first', (locale, earlier, later) => {
    const posts = [earlier, later].map((file) => {
      const article = readFileSync(`content/blogs/${locale}/${file}`, 'utf8')
      return {
        sourceId: `${locale}/blogs/${locale}/${file}`,
        date: article.match(/^date:\s*["'](.+?)["']/m)![1],
      }
    })
    expect(sortBlogPosts(posts)[0].sourceId).toContain(later)
    expect(sortBlogPosts([...posts].reverse())).toEqual(sortBlogPosts(posts))
    expect(posts[0].sourceId).toContain(earlier)
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
