import { describe, expect, it } from 'vitest'
import { SIGNAL_RESEARCH_THREADS } from '../data/signal/threads'

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
