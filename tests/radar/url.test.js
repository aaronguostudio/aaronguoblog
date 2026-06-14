import { describe, expect, it } from 'vitest'
import { canonicalizeUrl } from '../../scripts/radar/url.js'

describe('canonicalizeUrl', () => {
  it('removes tracking params, hashes, and trailing slash', () => {
    expect(canonicalizeUrl('https://Example.com/path/?utm_source=x&ref=share#section')).toBe('https://example.com/path')
  })

  it('keeps meaningful query params in sorted order', () => {
    expect(canonicalizeUrl('https://example.com/search?b=2&a=1&utm_medium=social')).toBe('https://example.com/search?a=1&b=2')
  })

  it('returns an empty string for invalid urls', () => {
    expect(canonicalizeUrl('not a url')).toBe('')
  })
})
