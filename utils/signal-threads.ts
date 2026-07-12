import type {
  SignalLocale,
  SignalDeepRead,
  SignalReadingStage,
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

export type SignalDeepReadSnapshot = SignalDeepRead & {
  topicSlug?: string
  threadSlug?: string
  status?: string
}

export type SignalThreadMatchedSignal = {
  id: number | string
  title: string
  url: string
  source: string
  topicSlug?: string
  note: string
  readingStage?: SignalReadingStage
  isAvailable: boolean
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
  deepRead?: {
    title: string
    question: string
    synthesis: string
    caveat: string
    readAt: string
    sources: Array<{
      url: string
      title: string
      finding: string
    }>
  }
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

function localizedTitle(ref: SignalThreadRef, locale: SignalLocale) {
  if (ref.title) return ref.title[locale] || ref.title.en

  try {
    return new URL(ref.url).hostname.replace(/^www\./, '')
  } catch {
    return ref.url
  }
}

function localizedDeepRead(deepRead: SignalDeepRead | undefined, locale: SignalLocale) {
  if (!deepRead) return undefined

  return {
    title: deepRead.title[locale] || deepRead.title.en,
    question: deepRead.question[locale] || deepRead.question.en,
    synthesis: deepRead.synthesis[locale] || deepRead.synthesis.en,
    caveat: deepRead.caveat[locale] || deepRead.caveat.en,
    readAt: deepRead.readAt,
    sources: deepRead.sources.map((source) => ({
      url: source.url,
      title: source.title[locale] || source.title.en,
      finding: source.finding[locale] || source.finding.en,
    })),
  }
}

function matchSignal(ref: SignalThreadRef, itemsByUrl: Map<string, SignalThreadRadarItem>) {
  return itemsByUrl.get(normalizeUrl(ref.url))
}

export function createSignalThreadCards({
  threads,
  items,
  locale,
  deepReads = [],
}: {
  threads: SignalResearchThread[]
  items: SignalThreadRadarItem[]
  locale: string
  deepReads?: SignalDeepReadSnapshot[]
}): SignalThreadCard[] {
  const signalLocale = normalizedLocale(locale)
  const itemsByUrl = new Map(items.map((item) => [normalizeUrl(item.url), item]))

  return threads.map((thread) => {
    const pipelineDeepRead = deepReads.find(
      (deepRead) =>
        deepRead.threadSlug === thread.slug || deepRead.topicSlug === thread.primaryTopicSlug,
    )
    const matchedSignals = thread.signalRefs.flatMap((ref) => {
      const item = matchSignal(ref, itemsByUrl)

      return [
        {
          id: item?.id || `thread-ref:${ref.url}`,
          title: item?.title || localizedTitle(ref, signalLocale),
          url: item?.url || ref.url,
          source: item?.source || 'editorial',
          topicSlug: item?.topic_slug || ref.topicSlug,
          note: localized(ref, signalLocale),
          readingStage: ref.readingStage,
          isAvailable: Boolean(item),
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
      deepRead: localizedDeepRead(pipelineDeepRead || thread.deepRead, signalLocale),
      matchedSignals,
      unmatchedSignalCount: matchedSignals.filter((signal) => !signal.isAvailable).length,
      relatedSignalCount: items.filter((item) => item.topic_slug === thread.primaryTopicSlug)
        .length,
    }
  })
}
