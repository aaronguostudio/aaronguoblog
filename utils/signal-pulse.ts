import { getRadarSnapshotTimestamp } from './radar-snapshot'

type SignalPulseLocale = 'en' | 'zh'

type FormatSignalPulseTextOptions = {
  text?: string | null
  locale?: string
}

export type SignalPulseSnapshot<T> = {
  text?: string | null
  date?: string | null
  generatedAt?: string | null
  items?: T[]
}

// Keep parsing legacy generated text while presenting the public product as Signal.
const LEGACY_PULSE_PATTERN =
  /^Radar found\s+(\d+)\s+high-signal items across\s+(.+?)\.\s+Top themes:\s+(.+?)\.?$/

function normalizeLocale(locale?: string): SignalPulseLocale {
  return locale === 'zh' ? 'zh' : 'en'
}

function formatEnglishTopic(topic: string) {
  if (topic === 'coding-agents') return 'coding-agent'
  return topic
}

export function formatSignalPulseText({ text, locale }: FormatSignalPulseTextOptions) {
  if (!text) return null

  const match = text.trim().match(LEGACY_PULSE_PATTERN)
  if (!match) return text

  const [, count, topic, themes] = match
  const pulseTopic = formatEnglishTopic(topic)
  const signalLocale = normalizeLocale(locale)

  if (signalLocale === 'zh') {
    return `最近一次 Signal 读数捕捉到 ${count} 条 ${pulseTopic} 强信号：${themes}.`
  }

  return `The current Signal read found ${count} strong ${pulseTopic} signals: ${themes}.`
}

function signalPulseTimestamp<T>(pulse: SignalPulseSnapshot<T>) {
  return getRadarSnapshotTimestamp({
    generatedAt: pulse.generatedAt,
    pulse: { date: pulse.date },
  })
}

/**
 * Keep every pulse field on the same snapshot so the date, text, and evidence
 * cannot accidentally come from different Signal runs.
 */
export function selectFreshestSignalPulse<T>(
  staticPulse: SignalPulseSnapshot<T> | null | undefined,
  livePulse: SignalPulseSnapshot<T> | null | undefined,
) {
  if (!staticPulse) return livePulse || null
  if (!livePulse) return staticPulse

  return signalPulseTimestamp(livePulse) > signalPulseTimestamp(staticPulse)
    ? livePulse
    : staticPulse
}
