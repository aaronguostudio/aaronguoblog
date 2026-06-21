type SignalPulseLocale = 'en' | 'zh'

type FormatSignalPulseTextOptions = {
  text?: string | null
  locale?: string
}

const RADAR_PULSE_PATTERN =
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

  const match = text.trim().match(RADAR_PULSE_PATTERN)
  if (!match) return text

  const [, count, topic, themes] = match
  const pulseTopic = formatEnglishTopic(topic)
  const signalLocale = normalizeLocale(locale)

  if (signalLocale === 'zh') {
    return `今天捕捉到 ${count} 条 ${pulseTopic} 强信号：${themes}.`
  }

  return `${count} strong ${pulseTopic} signals today: ${themes}.`
}
