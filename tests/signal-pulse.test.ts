import { describe, expect, it } from 'vitest'
import { formatSignalPulseText, selectFreshestSignalPulse } from '../utils/signal-pulse'

describe('formatSignalPulseText', () => {
  it('compresses the generated Radar pulse template without implying live freshness', () => {
    const formatted = formatSignalPulseText({
      text: 'Radar found 5 high-signal items across coding-agents. Top themes: built a factchecker that catches politicians lying in real time; New Claude code update is crazy; Cursor launches github for agentic era.',
      locale: 'en',
    })

    expect(formatted).toBe(
      'The latest Radar read found 5 strong coding-agent signals: built a factchecker that catches politicians lying in real time; New Claude code update is crazy; Cursor launches github for agentic era.',
    )
    expect(formatted).not.toContain('Radar found')
  })

  it('uses natural Chinese framing when the active locale is zh', () => {
    const formatted = formatSignalPulseText({
      text: 'Radar found 5 high-signal items across coding-agents. Top themes: built a factchecker that catches politicians lying in real time; New Claude code update is crazy.',
      locale: 'zh',
    })

    expect(formatted).toBe(
      '最近一次 Radar 读数捕捉到 5 条 coding-agent 强信号：built a factchecker that catches politicians lying in real time; New Claude code update is crazy.',
    )
  })

  it('leaves non-template pulse text unchanged', () => {
    expect(
      formatSignalPulseText({
        text: 'Coding agents are moving from assistance to ownership.',
        locale: 'en',
      }),
    ).toBe('Coding agents are moving from assistance to ownership.')
  })
})

describe('selectFreshestSignalPulse', () => {
  const staticPulse = {
    text: 'Static pulse',
    date: '2026-07-05',
    generatedAt: '2026-07-05T14:33:01Z',
    items: [{ id: 'static' }],
  }

  it('selects a newer live pulse as one coherent snapshot', () => {
    const livePulse = {
      text: 'Live pulse',
      date: '2026-07-11',
      generatedAt: '2026-07-11T13:32:54Z',
      items: [{ id: 'live' }],
    }

    expect(selectFreshestSignalPulse(staticPulse, livePulse)).toBe(livePulse)
  })

  it('keeps the static pulse when the live response is older or unavailable', () => {
    expect(
      selectFreshestSignalPulse(staticPulse, {
        text: 'Older live pulse',
        date: '2026-07-04',
        items: [{ id: 'old-live' }],
      }),
    ).toBe(staticPulse)
    expect(selectFreshestSignalPulse(staticPulse, null)).toBe(staticPulse)
  })
})
