import type {
  SignalLocale,
  SignalResearchThread,
  SignalThreadConfidence,
  SignalThreadHorizon,
  SignalThreadRef,
} from '../data/signal/threads'

export type SignalThreadRadarItem = {
  id: number | string
  url: string
  title: string
  source: string
  topic_slug?: string
  category?: string
  relevance?: number | string
  score?: number | string | null
  created_at?: string
}

export type SignalThreadMatchedSignal = {
  id: number | string
  title: string
  url: string
  source: string
  topicSlug?: string
  note: string
}

export type SignalThreadCard = {
  slug: string
  primaryTopicSlug: string
  horizon: SignalThreadHorizon
  title: string
  thesis: string
  builderImplication: string
  confidence: SignalThreadConfidence
  lastUpdated: string
  openQuestion: string
  productHypothesis: string
  matchedSignals: SignalThreadMatchedSignal[]
  unmatchedSignalCount: number
  relatedSignalCount: number
}

function normalizedLocale(locale: string): SignalLocale {
  return locale === 'zh' ? 'zh' : 'en'
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ''
    url.pathname = url.pathname.replace(/\/$/, '') || '/'
    url.searchParams.sort()
    return url.toString().replace(/\/$/, '')
  } catch {
    return value.trim().replace(/\/$/, '')
  }
}

function localized(ref: SignalThreadRef, locale: SignalLocale) {
  return ref.note[locale] || ref.note.en
}

function matchSignal(ref: SignalThreadRef, itemsByUrl: Map<string, SignalThreadRadarItem>) {
  return itemsByUrl.get(normalizeUrl(ref.url))
}

export function createSignalThreadCards({
  threads,
  items,
  locale,
}: {
  threads: SignalResearchThread[]
  items: SignalThreadRadarItem[]
  locale: string
}): SignalThreadCard[] {
  const signalLocale = normalizedLocale(locale)
  const itemsByUrl = new Map(items.map((item) => [normalizeUrl(item.url), item]))

  return threads.map((thread) => {
    const matchedSignals = thread.signalRefs.flatMap((ref) => {
      const item = matchSignal(ref, itemsByUrl)
      if (!item) return []

      return [
        {
          id: item.id,
          title: item.title,
          url: item.url,
          source: item.source,
          topicSlug: item.topic_slug,
          note: localized(ref, signalLocale),
        },
      ]
    })

    return {
      slug: thread.slug,
      primaryTopicSlug: thread.primaryTopicSlug,
      horizon: thread.horizon,
      title: thread.title[signalLocale] || thread.title.en,
      thesis: thread.thesis[signalLocale] || thread.thesis.en,
      builderImplication: thread.builderImplication[signalLocale] || thread.builderImplication.en,
      confidence: thread.confidence,
      lastUpdated: thread.lastUpdated,
      openQuestion: thread.openQuestion[signalLocale] || thread.openQuestion.en,
      productHypothesis: thread.productHypothesis[signalLocale] || thread.productHypothesis.en,
      matchedSignals,
      unmatchedSignalCount: thread.signalRefs.length - matchedSignals.length,
      relatedSignalCount: items.filter((item) => item.topic_slug === thread.primaryTopicSlug)
        .length,
    }
  })
}
