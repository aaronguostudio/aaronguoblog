import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FEED_URL,
  buildNewsletterDraft,
  parseArgs,
  parseRssItems,
} from '../scripts/newsletter/draft.js'

const PACKAGE_JSON = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

const RSS_FIXTURE = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Aaron Guo — Ship with AI, not about AI</title>
    <item>
      <title><![CDATA[The One-Person Project]]></title>
      <link>https://aaronguo.com/blogs/one-person-project-ai-coding</link>
      <guid>https://aaronguo.com/blogs/one-person-project-ai-coding</guid>
      <pubDate>Wed, 01 Jul 2026 00:00:00 GMT</pubDate>
      <description><![CDATA[AI coding is collapsing old handoff-heavy workflows into smaller ownership loops.]]></description>
    </item>
    <item>
      <title><![CDATA[I Gave Codex a Task From a Moving Tesla]]></title>
      <link>https://aaronguo.com/blogs/ai-became-my-operating-system</link>
      <pubDate>Sat, 20 Jun 2026 00:00:00 GMT</pubDate>
      <description><![CDATA[Codex changed AI from a coding assistant into a personal operating system.]]></description>
    </item>
  </channel>
</rss>`

describe('parseRssItems', () => {
  it('extracts RSS items in feed order', () => {
    const items = parseRssItems(RSS_FIXTURE)

    expect(items).toEqual([
      {
        title: 'The One-Person Project',
        link: 'https://aaronguo.com/blogs/one-person-project-ai-coding',
        pubDate: 'Wed, 01 Jul 2026 00:00:00 GMT',
        description: 'AI coding is collapsing old handoff-heavy workflows into smaller ownership loops.',
      },
      {
        title: 'I Gave Codex a Task From a Moving Tesla',
        link: 'https://aaronguo.com/blogs/ai-became-my-operating-system',
        pubDate: 'Sat, 20 Jun 2026 00:00:00 GMT',
        description: 'Codex changed AI from a coding assistant into a personal operating system.',
      },
    ])
  })
})

describe('buildNewsletterDraft', () => {
  it('creates a Beehiiv-ready notification draft for the latest post', () => {
    const draft = buildNewsletterDraft(parseRssItems(RSS_FIXTURE)[0])

    expect(draft).toContain('Subject: New post: The One-Person Project')
    expect(draft).toContain('Preview text: AI coding is collapsing old handoff-heavy workflows into smaller ownership loops.')
    expect(draft).toContain('Read it here:')
    expect(draft).toContain('https://aaronguo.com/blogs/one-person-project-ai-coding')
    expect(draft).toContain('You are receiving this because you subscribed at aaronguo.com.')
  })
})

describe('parseArgs', () => {
  it('uses the live blog RSS feed by default', () => {
    expect(parseArgs(['node', 'draft.js'])).toEqual({
      feedUrl: DEFAULT_FEED_URL,
      index: 0,
      out: undefined,
    })
  })

  it('parses optional feed, item index, and output path', () => {
    expect(parseArgs(['node', 'draft.js', '--feed', 'https://example.com/rss.xml', '--index', '2', '--out', 'draft.md'])).toEqual({
      feedUrl: 'https://example.com/rss.xml',
      index: 2,
      out: 'draft.md',
    })
  })

  it('rejects invalid item indexes', () => {
    expect(() => parseArgs(['node', 'draft.js', '--index', '-1'])).toThrow('--index must be a non-negative integer')
  })
})

describe('package script', () => {
  it('exposes a newsletter draft command', () => {
    expect(PACKAGE_JSON.scripts['newsletter:draft']).toBe('node scripts/newsletter/draft.js')
  })
})
