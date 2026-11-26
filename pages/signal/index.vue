<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { RadarLanguage, StaticRadarItem } from '~/composables/useStaticRadarSnapshot'
import { signalEditions } from '~/data/signal/editions'
import { SIGNAL_BRIEFS } from '~/data/signal/briefs'
import { SIGNAL_RESEARCH_THREADS } from '~/data/signal/threads'
import { selectPulseSnapshotItems, sortRadarItemsByDateDesc } from '~/utils/radar-snapshot'
import { createSignalBriefCards } from '~/utils/signal-briefs'
import { createSignalThreadCards } from '~/utils/signal-threads'

const { t, locale } = useI18n()
const previousEditions = signalEditions.slice(1, 3)

type SignalItem = {
  id: number | string
  source: string
  url: string
  title: string
  searchTitles: string[]
  lang?: RadarLanguage
  image?: string
  summary?: string | null
  ai_summary?: string | null
  score?: number | string | null
  relevance?: number | string
  category: string
  created_at: string
  last_seen_at?: string | null
  published_at?: string | null
  topic_slug?: string
}

useHead({
  title: t('signal.title'),
  meta: [
    {
      name: 'description',
      content: t('signal.description'),
    },
  ],
})

defineOgImageComponent('About', {
  headline: 'Signal',
  title: 'Signal — AI Product Research',
  description: "Evidence, working theses, and the product ideas I'm watching.",
})

const activeSource = ref('')
const activeCategory = ref('')
const activeTopic = ref('')
const searchQuery = ref('')
const visibleLimit = ref(50)
const showPulseEvidence = ref(false)
const activeThreadSlug = ref('')
const { data: staticSnapshot, status } = await useStaticRadarSnapshot('signal-radar-latest')
const titleLanguage = computed(() => locale.value === 'zh' ? 'zh' : 'en')
const topics = computed(() => staticSnapshot.value?.topics || [])
const topicCategories = computed(() => new Map(topics.value.map(topic => [topic.slug, topic.category])))

function languageLabel(lang?: RadarLanguage) {
  return lang && lang !== titleLanguage.value ? lang.toUpperCase() : ''
}

function trackSignalClick(item: Pick<SignalItem, 'id' | 'source' | 'topic_slug' | 'lang'>) {
  window.rybbit?.event('signal_click', {
    id: String(item.id),
    source: item.source,
    topic: item.topic_slug || 'general',
    lang: item.lang || 'other',
    locale: locale.value,
  })
}

function mapStaticItem(item: StaticRadarItem): SignalItem {
  const title = typeof item.title === 'string' ? { original: item.title } : item.title
  const topic = item.topic ?? item.topicSlug
  return {
    id: item.id,
    source: item.source,
    url: item.url,
    title: title[titleLanguage.value]?.trim() || title.original,
    searchTitles: Object.values(title).filter((value): value is string => Boolean(value)),
    lang: item.lang,
    image: item.image,
    summary: item.summary || '',
    ai_summary: item.aiSummary || '',
    score: item.score,
    relevance: item.relevance,
    category: item.category ?? topicCategories.value.get(topic || '') ?? 'general',
    topic_slug: topic,
    created_at: item.createdAt || '',
    last_seen_at: item.lastSeenAt || null,
    published_at: item.published_at ?? item.publishedAt ?? null,
  }
}

const researchSignalItems = computed(() =>
  sortRadarItemsByDateDesc((staticSnapshot.value?.items || []).map(mapStaticItem)),
)
const pulseDate = computed(() => staticSnapshot.value?.date || null)
const pulseItems = computed(() =>
  selectPulseSnapshotItems(researchSignalItems.value, staticSnapshot.value?.pulse?.topItemIds, 5),
)
const pulseText = computed(() =>
  t('signal.radarCoverage', { count: researchSignalItems.value.length }),
)

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return researchSignalItems.value.filter((item) => {
    if (activeSource.value && item.source !== activeSource.value) return false
    if (activeCategory.value && item.category !== activeCategory.value) return false
    if (activeTopic.value && item.topic_slug !== activeTopic.value) return false
    return !query || [...item.searchTitles, item.source, item.summary, item.ai_summary]
      .filter(Boolean).join(' ').toLowerCase().includes(query)
  })
})
watch([searchQuery, activeSource, activeCategory, activeTopic, staticSnapshot], () => {
  visibleLimit.value = 50
})
const totalCount = computed(() => filteredItems.value.length)
const allItems = computed(() => filteredItems.value.slice(0, visibleLimit.value))
const canLoadMore = computed(() => visibleLimit.value < totalCount.value)
const loadMoreSentinel = ref<HTMLElement | null>(null)
function loadMore() {
  visibleLimit.value += 50
}

useIntersectionObserver(
  loadMoreSentinel,
  ([entry]) => {
    if (entry?.isIntersecting) void loadMore()
  },
  { rootMargin: '600px 0px' },
)

function stripHtml(value: string) {
  if (!value) return ''
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function isDuplicate(summary: string, title: string) {
  const normalizedSummary = summary.toLowerCase().trim()
  const normalizedTitle = title.trim()
  if (normalizedSummary === normalizedTitle) return true
  if (
    normalizedSummary.startsWith(normalizedTitle) &&
    normalizedSummary.length < normalizedTitle.length * 1.3
  ) {
    return true
  }
  return (
    normalizedTitle.startsWith(normalizedSummary) &&
    normalizedTitle.length < normalizedSummary.length * 1.3
  )
}

function getSummary(item: SignalItem): { text: string; isAi: boolean } | null {
  const title = stripHtml(item.title).toLowerCase()
  const ai = item.ai_summary ? stripHtml(item.ai_summary) : ''
  const regular = item.summary ? stripHtml(item.summary) : ''
  if (ai && !isDuplicate(ai, title)) return { text: ai, isAi: true }
  if (regular && !isDuplicate(regular, title)) return { text: regular, isAi: false }
  return null
}

function parseDate(value: string | null | undefined) {
  if (!value) return null
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00Z`
    : /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
      ? value
      : `${value.replace(' ', 'T')}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDisplayDate(value: string | null | undefined, includeYear = false) {
  const date = parseDate(value)
  if (!date) return t('signal.dateUnavailable')
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    month: locale.value === 'zh' ? 'numeric' : 'short',
    day: 'numeric',
    year: includeYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(date)
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    grounding: t('signal.openWeb'),
    hackernews: 'Hacker News',
    'x-twitter': 'X',
    x: 'X',
    reddit: 'Reddit',
    producthunt: 'Product Hunt',
    github: 'GitHub',
    lobsters: 'Lobsters',
    arxiv: 'arXiv',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    polymarket: 'Polymarket',
    web: t('signal.openWeb'),
  }
  return labels[source] || source
}

function sourceIcon(source: string) {
  const icons: Record<string, string> = {
    grounding: 'heroicons:globe-alt',
    web: 'heroicons:globe-alt',
    hackernews: 'simple-icons:ycombinator',
    reddit: 'simple-icons:reddit',
    github: 'simple-icons:github',
    youtube: 'simple-icons:youtube',
    'x-twitter': 'ri:twitter-x-fill',
    x: 'ri:twitter-x-fill',
    arxiv: 'simple-icons:arxiv',
    producthunt: 'simple-icons:producthunt',
  }
  return icons[source] || 'heroicons:link'
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    ai: 'AI',
    coding: 'Code',
    indie: 'Indie',
    fintech: 'Fintech',
    management: 'Management',
    content: 'Content',
    general: 'General',
  }
  return labels[category] || category
}

const availableSources = computed(() => (staticSnapshot.value?.stats || []).map(stat => stat.source))
const availableCategories = computed(() =>
  [...new Set(researchSignalItems.value.map(item => item.category).filter(Boolean))].sort(),
)

const threadCards = computed(() =>
  createSignalThreadCards({
    threads: SIGNAL_RESEARCH_THREADS,
    items: researchSignalItems.value,
    locale: locale.value,
    deepReads: staticSnapshot.value?.deepReads || [],
  }),
)

const lastThreadUpdate = SIGNAL_RESEARCH_THREADS.map((thread) => thread.lastUpdated)
  .sort()
  .at(-1)

const briefCards = computed(() =>
  createSignalBriefCards({
    briefs: SIGNAL_BRIEFS,
    locale: locale.value,
  }),
)

const pulseCards = computed(() =>
  pulseItems.value.map((item) => ({
    id: String(item.id),
    url: item.url,
    title: stripHtml(item.title),
    lang: item.lang,
    languageLabel: languageLabel(item.lang),
    image: item.image,
    source: item.source,
    topic_slug: item.topic_slug,
    summary: getSummary(item)?.text || '',
    sourceLabel: sourceLabel(item.source),
    sourceIcon: sourceIcon(item.source),
    publishedLabel: formatDisplayDate(item.published_at || item.created_at),
  })),
)

async function scrollToSection(id: string) {
  if (!import.meta.client) return
  await nextTick()
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
}

async function openEvidenceWorkbench(topic = '') {
  activeTopic.value = topic
  activeSource.value = ''
  activeCategory.value = ''
  searchQuery.value = ''
  visibleLimit.value = 50
  await scrollToSection('signal-workbench')
}
</script>

<template>
  <div class="signal-page">
    <SignalReadingDesk :edition="signalEditions[0]" :previous-editions="previousEditions" />
    <main class="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16">
      <SignalEditionFinding :edition="signalEditions[0]" />

      <button
        type="button"
        class="signal-accent py-5 text-sm underline underline-offset-4"
        :aria-expanded="showPulseEvidence"
        @click="showPulseEvidence = !showPulseEvidence"
      >
        {{ t('signal.radarReadout')
        }}<template v-if="pulseDate"> · {{ formatDisplayDate(pulseDate, true) }}</template>
      </button>

      <SignalPulse
        :open="showPulseEvidence"
        :pulse-text="pulseText"
        :pulse-date="pulseDate ? formatDisplayDate(pulseDate, true) : null"
        :heading="t('signal.radarReadout')"
        :description="t('signal.radarScope')"
        :machine-label="t('signal.machineReadout')"
        :evidence-label="t('signal.pulseEvidenceLabel')"
        :close-label="t('signal.close')"
        :full-evidence-label="t('signal.openWorkbench')"
        :pulse-cards="pulseCards"
        @signal-click="trackSignalClick"
        @close="showPulseEvidence = false"
        @open-workbench="openEvidenceWorkbench()"
      />

      <details class="signal-rule border-y py-5">
        <summary class="cursor-pointer text-sm font-medium">
          {{ t('signal.priorThreads') }} · {{ formatDisplayDate(lastThreadUpdate, true) }}
        </summary>
        <SignalResearchThreads
          v-model:open-slug="activeThreadSlug"
          :threads="threadCards"
          :heading="t('signal.horizonTitle')"
          :description="t('signal.horizonDescription')"
          :now-label="t('signal.horizonNow')"
          :emerging-label="t('signal.horizonEmerging')"
          :watch-label="t('signal.horizonWatch')"
          :thesis-label="t('signal.activeThesis')"
          :take-label="t('signal.aaronsTake')"
          :question-label="t('signal.openQuestion')"
          :product-angle-label="t('signal.productHypothesis')"
          :supporting-signals-label="t('signal.supportingSignals')"
          :deep-read-section-label="t('signal.deepRead')"
          :deep-read-question-label="t('signal.deepReadQuestion')"
          :deep-read-synthesis-label="t('signal.deepReadSynthesis')"
          :deep-read-evidence-label="t('signal.deepReadEvidence')"
          :deep-read-caveat-label="t('signal.deepReadCaveat')"
          :deep-read-read-at-label="t('signal.deepReadReadAt')"
          :selected-source-label="t('signal.selectedSource')"
          :deep-read-label="t('signal.deepReadSource')"
          :research-note-label="t('signal.researchNote')"
          :archived-source-label="t('signal.archivedSource')"
          :related-items-label="t('signal.relatedItems')"
          :explore-related-label="t('signal.exploreRelatedEvidence')"
          :explore-all-label="t('signal.exploreAllEvidence')"
          :expand-label="t('signal.expand')"
          :collapse-label="t('signal.collapse')"
          @explore-topic="openEvidenceWorkbench"
          @explore-all="openEvidenceWorkbench()"
        />
      </details>

      <SignalBriefs
        :briefs="briefCards"
        :heading="t('signal.previousBriefings')"
        :description="t('signal.previousBriefingsDescription')"
        :latest-label="t('signal.briefsLatest')"
        :weekly-brief-label="t('signal.weeklyBrief')"
        :signals-distilled-label="t('signal.signalsDistilled')"
        :open-label="t('signal.openBrief')"
        :close-label="t('signal.closeBrief')"
      />

      <section id="signal-workbench" class="signal-rule scroll-mt-28 border-b py-12 lg:py-16">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="signal-accent font-mono text-[10px] uppercase tracking-[0.18em]">
              {{ t('signal.evidenceEyebrow') }}
            </p>
            <h2 class="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
              {{ t('signal.researchWorkbench') }}
            </h2>
            <p
              class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
            >
              {{ t('signal.workbenchDescription') }}
            </p>
          </div>
        </div>

        <div
          class="signal-rule signal-sticky sticky top-[5.5rem] z-30 mt-8 grid gap-3 border-y py-4 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_12rem_12rem_14rem]"
        >
          <label class="relative block">
            <span class="sr-only">{{ t('signal.search') }}</span>
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-70"
            />
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="t('signal.searchEvidence')"
              class="signal-control form-input w-full rounded-lg py-2.5 pl-10 pr-3 text-sm"
            />
          </label>

          <label>
            <span class="sr-only">{{ t('signal.sourceFilter') }}</span>
            <select
              v-model="activeSource"
              class="signal-control form-select w-full rounded-lg py-2.5 text-sm"
            >
              <option value="">{{ t('signal.allSources') }}</option>
              <option v-for="source in availableSources" :key="source" :value="source">
                {{ sourceLabel(source) }}
              </option>
            </select>
          </label>

          <label>
            <span class="sr-only">{{ t('signal.categoryFilter') }}</span>
            <select
              v-model="activeCategory"
              class="signal-control form-select w-full rounded-lg py-2.5 text-sm"
            >
              <option value="">{{ t('signal.allCategories') }}</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ categoryLabel(category) }}
              </option>
            </select>
          </label>

          <label>
            <span class="sr-only">{{ t('signal.topicFilter') }}</span>
            <select
              v-model="activeTopic"
              class="signal-control form-select w-full rounded-lg py-2.5 text-sm"
            >
              <option value="">{{ t('signal.allTopics') }}</option>
              <option v-for="topic in topics" :key="topic.slug" :value="topic.slug">
                {{ topic.name }}
              </option>
            </select>
          </label>
        </div>

        <div
          class="mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground opacity-75"
        >
          <span>{{ allItems.length }} / {{ totalCount }} {{ t('signal.browseableItems') }}</span>
        </div>

        <div
          v-if="status === 'pending' && allItems.length === 0"
          class="flex items-center justify-center gap-3 py-24 text-muted-foreground"
        >
          <Icon name="svg-spinners:180-ring" class="signal-accent h-5 w-5" />
          <span class="text-sm">{{ t('signal.loading') }}</span>
        </div>

        <div
          v-else-if="allItems.length > 0"
          class="signal-divide signal-rule mt-4 divide-y border-y"
        >
          <a
            v-for="item in allItems"
            :key="item.id"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="signal-row group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-5 py-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--signal-accent)] sm:px-6 sm:py-6"
            @click="trackSignalClick(item)"
          >
            <span class="min-w-0">
              <span
                class="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground opacity-75"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current" />
                <span>{{ sourceLabel(item.source) }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ categoryLabel(item.category) }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatDisplayDate(item.published_at || item.created_at) }}</span>
              </span>
              <span
                class="mt-2 block text-base font-semibold leading-snug text-foreground opacity-80 transition-opacity group-hover:opacity-100 sm:text-lg"
              >
                {{ stripHtml(item.title) }}
                <span
                  v-if="languageLabel(item.lang)"
                  class="ml-1 rounded border px-1 py-0.5 align-middle font-mono text-[10px] font-normal text-muted-foreground"
                >{{ languageLabel(item.lang) }}</span>
              </span>
              <span
                v-if="getSummary(item)"
                class="mt-2 line-clamp-2 block max-w-4xl text-sm leading-6 text-muted-foreground"
              >
                {{ getSummary(item)!.text }}
              </span>
            </span>
            <SignalEvidenceThumbnail :image="item.image" />
          </a>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-24 text-center">
          <Icon
            name="heroicons:magnifying-glass"
            class="h-8 w-8 text-muted-foreground opacity-55"
          />
          <p class="mt-4 text-sm text-muted-foreground">{{ t('signal.empty') }}</p>
        </div>

        <div
          v-if="canLoadMore"
          ref="loadMoreSentinel"
          class="flex min-h-28 items-center justify-center py-8"
          aria-live="polite"
        >
          <button
            type="button"
            class="signal-rule-strong inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:border-[var(--signal-accent)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)] disabled:cursor-wait disabled:opacity-60"
            @click="loadMore"
          >
            {{ t('signal.loadMore') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
