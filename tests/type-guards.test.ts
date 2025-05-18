import { describe, it, expect } from 'vitest'
import { isBlogPost, toBlogPost, extractBlogPostMeta } from '../utils/type-guards'
import type { BlogPost } from '../types/blog'

describe('isBlogPost', () => {
  const valid: BlogPost = {
    title: 'Test',
    date: '2024-01-01',
    description: 'desc',
    image: '/img.jpg',
    alt: 'alt',
    ogImage: '/og.jpg',
    tags: ['a'],
    published: true
  }

  it('identifies a valid BlogPost', () => {
    expect(isBlogPost(valid)).toBe(true)
  })

  it('returns false for invalid object', () => {
    expect(isBlogPost({})).toBe(false)
  })
})

describe('toBlogPost', () => {
  const valid: BlogPost = {
    title: 'Valid',
    date: '2024-01-02',
    description: 'desc',
    image: '/img.jpg',
    alt: 'alt',
    ogImage: '/og.jpg',
    tags: ['t'],
    published: true
  }

  it('returns the same object if already a BlogPost', () => {
    expect(toBlogPost(valid)).toBe(valid)
  })

  it('returns defaults for invalid object', () => {
    const result = toBlogPost({})
    expect(result.title).toBe('Untitled')
    expect(result.description).toBe('No description available')
    expect(result.image).toBe('/not-found.jpg')
    expect(result.alt).toBe('No image description available')
    expect(result.ogImage).toBe('/not-found.jpg')
    expect(result.tags).toEqual([])
    expect(result.published).toBe(false)
    expect(new Date(result.date).toString()).not.toBe('Invalid Date')
  })
})

describe('extractBlogPostMeta', () => {
  it('extracts metadata from content object', () => {
    const content = {
      title: 'Hello',
      description: 'desc',
      meta: {
        date: '2024-03-04',
        image: '/img.jpg',
        alt: 'alt',
        ogImage: '/og.jpg',
        tags: ['tag'],
        published: true
      }
    }

    const result = extractBlogPostMeta(content)
    expect(result.title).toBe('Hello')
    expect(result.description).toBe('desc')
    expect(result.date).toBe('2024-03-04')
    expect(result.image).toBe('/img.jpg')
    expect(result.alt).toBe('alt')
    expect(result.ogImage).toBe('/og.jpg')
    expect(result.tags).toEqual(['tag'])
    expect(result.published).toBe(true)
  })

  it('handles empty content', () => {
    const result = extractBlogPostMeta(undefined as any)
    expect(result.title).toBe('Untitled')
    expect(result.description).toBe('No description available')
    expect(result.image).toBe('/not-found.jpg')
    expect(result.alt).toBe('No image description available')
    expect(result.ogImage).toBe('/not-found.jpg')
    expect(result.tags).toEqual([])
    expect(result.published).toBe(false)
    expect(new Date(result.date).toString()).not.toBe('Invalid Date')
  })
})
