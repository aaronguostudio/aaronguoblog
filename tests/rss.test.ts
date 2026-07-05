import { describe, expect, it } from 'vitest'
import { getRssPostDate, getRssPostUrl, isPublishedRssPost } from '../utils/rss'

describe('getRssPostDate', () => {
  it('parses ordinal frontmatter dates for valid RSS pubDate values', () => {
    const date = getRssPostDate({ meta: { date: '1st Jul 2026' } })

    expect(Number.isNaN(date.getTime())).toBe(false)
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(6)
    expect(date.getDate()).toBe(1)
  })
})

describe('getRssPostUrl', () => {
  it('builds the public English blog URL from a content path', () => {
    expect(getRssPostUrl('/blogs/en/one-person-project-ai-coding', 'en')).toBe(
      'https://aaronguo.com/blogs/one-person-project-ai-coding',
    )
  })

  it('builds the public Chinese blog URL from a content path', () => {
    expect(getRssPostUrl('/blogs/zh/one-person-project-ai-coding', 'zh')).toBe(
      'https://aaronguo.com/zh/blogs/one-person-project-ai-coding',
    )
  })
})

describe('isPublishedRssPost', () => {
  it('only includes posts explicitly marked as published', () => {
    expect(isPublishedRssPost({ meta: { published: true } })).toBe(true)
    expect(isPublishedRssPost({ meta: { published: false } })).toBe(false)
    expect(isPublishedRssPost({ meta: {} })).toBe(false)
  })
})
