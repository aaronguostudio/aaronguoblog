import { describe, expect, it } from 'vitest'
import { formatSignalPulseText } from '../utils/signal-pulse'

describe('formatSignalPulseText', () => {
  it('compresses the generated Radar pulse template into a reader-facing daily readout', () => {
    const formatted = formatSignalPulseText({
      text: 'Radar found 5 high-signal items across coding-agents. Top themes: built a factchecker that catches politicians lying in real time; New Claude code update is crazy; Cursor launches github for agentic era.',
      locale: 'en',
    })

    expect(formatted).toBe(
      '5 strong coding-agent signals today: built a factchecker that catches politicians lying in real time; New Claude code update is crazy; Cursor launches github for agentic era.',
    )
    expect(formatted).not.toContain('Radar found')
  })

  it('uses natural Chinese framing when the active locale is zh', () => {
    const formatted = formatSignalPulseText({
      text: 'Radar found 5 high-signal items across coding-agents. Top themes: built a factchecker that catches politicians lying in real time; New Claude code update is crazy.',
      locale: 'zh',
    })

    expect(formatted).toBe(
      '今天捕捉到 5 条 coding-agent 强信号：built a factchecker that catches politicians lying in real time; New Claude code update is crazy.',
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
