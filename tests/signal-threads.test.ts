import { describe, expect, it } from 'vitest'
import { SIGNAL_RESEARCH_THREADS } from '../data/signal/threads'
import { createSignalThreadCards } from '../utils/signal-threads'

describe('Signal research threads', () => {
  it('defines the first three public research threads', () => {
    expect(SIGNAL_RESEARCH_THREADS.map((thread) => thread.slug)).toEqual([
      'coding-agents-own-workflows',
      'solo-builders-small-team-output',
      'internal-workflows-become-products',
    ])
  })

  it('includes bilingual reader-facing copy for every thread', () => {
    for (const thread of SIGNAL_RESEARCH_THREADS) {
      expect(thread.title.en).toMatch(/\S/)
      expect(thread.title.zh).toMatch(/\S/)
      expect(thread.thesis.en).toMatch(/\S/)
      expect(thread.thesis.zh).toMatch(/\S/)
      expect(thread.builderImplication.en).toMatch(/\S/)
      expect(thread.builderImplication.zh).toMatch(/\S/)
      expect(thread.productHypothesis.en).toMatch(/\S/)
      expect(thread.productHypothesis.zh).toMatch(/\S/)
      expect(thread.signalRefs.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('createSignalThreadCards', () => {
  const radarItems = [
    {
      id: 1,
      url: 'https://cursor.com/',
      title: 'Cursor: AI coding agent',
      source: 'grounding',
      topic_slug: 'coding-agents',
      category: 'coding',
      relevance: 10,
      score: 0,
      created_at: '2026-06-18 13:32:55',
    },
    {
      id: 2,
      url: 'https://kiro.dev/',
      title: 'Kiro: Move beyond AI coding to agentic engineering',
      source: 'grounding',
      topic_slug: 'coding-agents',
      category: 'coding',
      relevance: 10,
      score: 0,
      created_at: '2026-06-18 13:32:54',
    },
  ]

  it('localizes thread cards and resolves supporting signals by URL', () => {
    const cards = createSignalThreadCards({
      threads: SIGNAL_RESEARCH_THREADS,
      items: radarItems,
      locale: 'en',
    })

    expect(cards[0]).toMatchObject({
      slug: 'coding-agents-own-workflows',
      title: 'Coding agents are becoming workflow owners',
      confidence: 'high',
      unmatchedSignalCount: 1,
    })

    expect(cards[0].matchedSignals.slice(0, 2)).toMatchObject([
      {
        id: 1,
        title: 'Cursor: AI coding agent',
        url: 'https://cursor.com/',
        source: 'grounding',
        readingStage: 'selected',
        isAvailable: true,
      },
      {
        id: 2,
        title: 'Kiro: Move beyond AI coding to agentic engineering',
        url: 'https://kiro.dev/',
        source: 'grounding',
        readingStage: 'deep-read',
        isAvailable: true,
      },
    ])

    expect(cards[0].deepRead).toMatchObject({
      title: 'Deep read: the workflow is becoming the product',
      sources: [
        { title: 'Cursor Developer Habits Report' },
        { title: 'Kiro: agentic engineering' },
        { title: 'Ornith-1.0: self-improving agentic coding' },
      ],
    })
  })

  it('keeps editorial references visible when the source has left the current snapshot', () => {
    const cards = createSignalThreadCards({
      threads: SIGNAL_RESEARCH_THREADS.slice(0, 1),
      items: [],
      locale: 'en',
    })

    expect(cards[0].matchedSignals[0]).toMatchObject({
      title: 'Cursor',
      url: 'https://cursor.com/',
      readingStage: 'selected',
      isAvailable: false,
    })
    expect(cards[0].unmatchedSignalCount).toBe(3)
  })

  it('matches URLs after stripping hash, sorting query params, and trimming path trailing slash', () => {
    const thread = {
      ...SIGNAL_RESEARCH_THREADS[0],
      signalRefs: [
        {
          url: 'https://example.com/path/?b=2&a=1#hash',
          note: {
            en: 'Query params and path slash should normalize before matching.',
            zh: 'Query params and path slash should normalize before matching.',
          },
        },
      ],
    }

    const cards = createSignalThreadCards({
      threads: [thread],
      items: [
        {
          id: 'normalized-url',
          url: 'https://example.com/path?a=1&b=2',
          title: 'Normalized URL signal',
          source: 'grounding',
        },
      ],
      locale: 'en',
    })

    expect(cards[0].matchedSignals).toMatchObject([
      {
        id: 'normalized-url',
        title: 'Normalized URL signal',
        url: 'https://example.com/path?a=1&b=2',
        source: 'grounding',
      },
    ])
    expect(cards[0].unmatchedSignalCount).toBe(0)
  })

  it('returns Chinese copy when locale is zh', () => {
    const cards = createSignalThreadCards({
      threads: SIGNAL_RESEARCH_THREADS.slice(0, 1),
      items: radarItems,
      locale: 'zh',
    })

    expect(cards[0].title).toBe('Coding agents 正在变成工作流负责人')
    expect(cards[0].builderImplication).toContain('构建者')
  })
})
