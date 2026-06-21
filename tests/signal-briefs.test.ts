import { describe, expect, it } from 'vitest'
import { SIGNAL_BRIEFS } from '../data/signal/briefs'
import { createSignalBriefCards } from '../utils/signal-briefs'

describe('Signal briefs', () => {
  it('defines cadence and funnel metadata for future trend distillation', () => {
    expect(SIGNAL_BRIEFS[0]).toMatchObject({
      cadence: 'weekly',
      signalCount: 5,
      funnelStage: 'brief',
    })
    expect(SIGNAL_BRIEFS[0].periodLabel.en).toBe('Week of Jun 21, 2026')
    expect(SIGNAL_BRIEFS[0].periodLabel.zh).toBe('2026 年 6 月 21 日周')
  })
})

describe('createSignalBriefCards', () => {
  it('localizes brief funnel metadata into renderable cards', () => {
    const cards = createSignalBriefCards({
      briefs: SIGNAL_BRIEFS,
      locale: 'en',
    })

    expect(cards[0]).toMatchObject({
      cadence: 'weekly',
      periodLabel: 'Week of Jun 21, 2026',
      signalCount: 5,
      funnelStage: 'brief',
    })
  })
})
