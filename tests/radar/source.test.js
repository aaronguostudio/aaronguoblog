import { describe, expect, it } from 'vitest'
import { getSourceLabel, getSupportedSources } from '../../scripts/radar/source.js'

describe('source metadata', () => {
  it('labels known last30days sources', () => {
    expect(getSourceLabel('hackernews')).toBe('HN')
    expect(getSourceLabel('polymarket')).toBe('Polymarket')
    expect(getSourceLabel('youtube')).toBe('YouTube')
  })

  it('falls back to source id for unknown sources', () => {
    expect(getSourceLabel('new-source')).toBe('new-source')
  })

  it('includes legacy and last30days sources', () => {
    expect(getSupportedSources()).toEqual([
      'hackernews',
      'x-twitter',
      'reddit',
      'producthunt',
      'github',
      'lobsters',
      'arxiv',
      'youtube',
      'tiktok',
      'instagram',
      'polymarket',
      'web',
    ])
  })
})
