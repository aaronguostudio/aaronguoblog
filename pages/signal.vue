<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { StaticRadarItem } from '~/composables/useStaticRadarSnapshot'
import { SIGNAL_BRIEFS } from '~/data/signal/briefs'
import { SIGNAL_RESEARCH_THREADS } from '~/data/signal/threads'
import { formatSignalPulseText, selectFreshestSignalPulse } from '~/utils/signal-pulse'
import { selectPulseSnapshotItems, sortRadarItemsByDateDesc } from '~/utils/radar-snapshot'
import { createSignalBriefCards } from '~/utils/signal-briefs'
import { createSignalThreadCards } from '~/utils/signal-threads'

const { t, locale } = useI18n()

type SignalItem = {
  id: number | string
  source: string
  url: string
  title: string
  summary?: string | null
  ai_summary?: string | null
  score?: number | string | null
  relevance?: number | string
  category: string
  created_at: string
  published_at?: string | null
  topic_slug?: string
}

type SignalStat = {
  source: string
  count: number | string
}

type RadarTopicOption = {
  slug: string
  name: string
}

type SignalResponse = {
  available?: boolean
  items?: SignalItem[]
  total?: number | string
  stats?: SignalStat[]
  topics?: RadarTopicOption[]
}

type SignalPulseResponse = {
  pulse?: string | null
  date?: string | null
  generatedAt?: string | null
  items?: SignalItem[]
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
const offset = ref(0)
const allItems = ref<SignalItem[]>([])
const totalCount = ref(0)
const statsData = ref<SignalStat[] | null>(null)

const showPulseEvidence = ref(false)
const activeThreadSlug = ref('')
const liveFeedReady = ref(false)

const { data: staticSnapshot } = await useStaticRadarSnapshot('signal-radar-latest')

const hasStaticSnapshot = computed(() => Boolean(staticSnapshot.value?.items?.length))

const { data: pulseData, refresh: refreshPulse } = await useFetch<SignalPulseResponse>(
  '/api/signal-pulse',
  {
    immediate: false,
    server: false,
    watch: false,
  },
)

function mapStaticItem(item: StaticRadarItem): SignalItem {
  return {
    id: item.id,
    source: item.source,
    url: item.url,
    title: item.title,
    summary: item.summary || '',
    ai_summary: item.aiSummary || '',
    score: item.score,
    relevance: item.relevance,
    category: item.category,
    topic_slug: item.topicSlug,
    created_at: item.createdAt || staticSnapshot.value?.generatedAt || '',
    published_at: item.publishedAt || null,
  }
}

function getStaticItems() {
  return sortRadarItemsByDateDesc((staticSnapshot.value?.items || []).map(mapStaticItem))
}

function getStaticPulseItems() {
  const items = getStaticItems()
  const topIds = staticSnapshot.value?.pulse?.topItemIds || []
  return selectPulseSnapshotItems<SignalItem>(items, topIds, 5)
}

const activePulse = computed(() =>
  selectFreshestSignalPulse<SignalItem>(
    staticSnapshot.value?.pulse
      ? {
          text: staticSnapshot.value.pulse.text,
          date: staticSnapshot.value.pulse.date,
          generatedAt: staticSnapshot.value.generatedAt,
          items: getStaticPulseItems(),
        }
      : null,
    pulseData.value?.date || pulseData.value?.pulse
      ? {
          text: pulseData.value.pulse,
          date: pulseData.value.date,
          generatedAt: pulseData.value.generatedAt,
          items: (pulseData.value.items || []).slice(0, 5),
        }
      : null,
  ),
)

const rawPulseText = computed(() => activePulse.value?.text || null)
const pulseText = computed(() =>
  formatSignalPulseText({
    text: rawPulseText.value,
    locale: locale.value,
  }),
)
const pulseDate = computed(() => activePulse.value?.date || null)
const pulseItems = computed(() => activePulse.value?.items || [])

function applyStaticFilters({ append = false } = {}) {
  const query = searchQuery.value.trim().toLowerCase()
  const filtered = getStaticItems().filter((item) => {
    if (activeSource.value && item.source !== activeSource.value) return false
    if (activeCategory.value && item.category !== activeCategory.value) return false
    if (activeTopic.value && item.topic_slug !== activeTopic.value) return false
    if (!query) return true

    return [item.title, item.summary, item.ai_summary]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const nextItems = filtered.slice(offset.value, offset.value + 50)
  allItems.value = append ? [...allItems.value, ...nextItems] : nextItems
  totalCount.value = filtered.length
  statsData.value = staticSnapshot.value?.stats || []
}

const {
  data,
  refresh: refreshApi,
  status,
  error: feedError,
} = await useFetch<SignalResponse>('/api/signal', {
  query: computed(() => ({
    source: activeSource.value,
    category: activeCategory.value,
    topic: activeTopic.value,
    minRelevance: 5,
    offset: offset.value,
    q: searchQuery.value,
    limit: 50,
  })),
  immediate: false,
  server: false,
  watch: false,
  onResponse({ response }) {
    const result = response._data
    if (!result) return

    if (result.available === false) {
      return
    }

    liveFeedReady.value = true
    const nextItems = result.items || []
    if (offset.value === 0) {
      allItems.value = sortRadarItemsByDateDesc(nextItems)
    } else {
      const uniqueItems = new Map(
        [...allItems.value, ...nextItems].map((item) => [String(item.id), item]),
      )
      allItems.value = sortRadarItemsByDateDesc([...uniqueItems.values()])
    }
    totalCount.value = Number(result.total) || 0
    if (result.stats) statsData.value = result.stats
  },
})

async function refreshSignalData() {
  await refreshApi()

  if (feedError.value || data.value?.available === false) {
    applyStaticFilters()
  }
}

if (hasStaticSnapshot.value) {
  applyStaticFilters()
}

watch(staticSnapshot, (snapshot) => {
  if (!snapshot?.items?.length || liveFeedReady.value) return
  offset.value = 0
  applyStaticFilters()
})

let searchTimer: ReturnType<typeof setTimeout>
function onSearch(value: string) {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = value
    offset.value = 0
    refreshSignalData()
  }, 300)
}

onMounted(() => {
  void Promise.allSettled([refreshPulse(), refreshSignalData()])
})

onBeforeUnmount(() => clearTimeout(searchTimer))

function setSource(source: string) {
  activeSource.value = source
  offset.value = 0
  refreshSignalData()
}

function setCategory(category: string) {
  activeCategory.value = category
  offset.value = 0
  refreshSignalData()
}

function setTopic(topic: string) {
  activeTopic.value = topic
  offset.value = 0
  refreshSignalData()
}

const isLoadingMore = ref(false)
const canLoadMore = computed(() => allItems.value.length < totalCount.value)
const loadMoreSentinel = ref<HTMLElement | null>(null)

async function loadMore() {
  if (isLoadingMore.value || !canLoadMore.value) return

  isLoadingMore.value = true
  offset.value = allItems.value.length

  try {
    await refreshApi()
    if (feedError.value || data.value?.available === false) {
      applyStaticFilters({ append: true })
    }
  } finally {
    isLoadingMore.value = false
  }
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

function sourceDotClass(source: string) {
  const colors: Record<string, string> = {
    grounding: 'bg-emerald-300',
    web: 'bg-emerald-300',
    reddit: 'bg-orange-300',
    hackernews: 'bg-orange-400',
    github: 'bg-violet-300',
    youtube: 'bg-red-300',
    'x-twitter': 'bg-zinc-600 dark:bg-white/75',
    x: 'bg-zinc-600 dark:bg-white/75',
    arxiv: 'bg-cyan-300',
  }
  return colors[source] || 'bg-zinc-400 dark:bg-white/36'
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

const topics = computed(() => {
  const sourceTopics =
    (liveFeedReady.value ? data.value?.topics : staticSnapshot.value?.topics) ||
    staticSnapshot.value?.topics ||
    []
  return sourceTopics.map((topic) => ({ slug: topic.slug, name: topic.name }))
})

const filterItems = computed(() =>
  liveFeedReady.value
    ? allItems.value
    : hasStaticSnapshot.value
      ? getStaticItems()
      : allItems.value,
)

const availableSources = computed(() => {
  const counts = new Map<string, number>()
  for (const stat of statsData.value || []) counts.set(stat.source, Number(stat.count) || 0)
  for (const item of filterItems.value) {
    if (!counts.has(item.source)) counts.set(item.source, 0)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([source]) => source)
})

const availableCategories = computed(() => {
  const values = new Set(filterItems.value.map((item) => item.category).filter(Boolean))
  return [...values].sort()
})

const researchSignalItems = computed(() => {
  if (hasStaticSnapshot.value) return getStaticItems()
  return allItems.value
})

const threadCards = computed(() =>
  createSignalThreadCards({
    threads: SIGNAL_RESEARCH_THREADS,
    items: researchSignalItems.value,
    locale: locale.value,
    deepReads: staticSnapshot.value?.deepReads || [],
  }),
)

const briefCards = computed(() =>
  createSignalBriefCards({
    briefs: SIGNAL_BRIEFS,
    locale: locale.value,
  }),
)

const focusedThread = computed(
  () => threadCards.value.find((thread) => thread.horizon === 'now') || threadCards.value[0],
)

function firstSentence(value: string) {
  const match = value.match(/^.*?[.!?](?:\s|$)/)
  return (match?.[0] || value).trim()
}

const heroEyebrow = computed(() => {
  const date = pulseDate.value
    ? formatDisplayDate(pulseDate.value, true)
    : t('signal.dateUnavailable')
  return `${t('signal.latestRead')} · ${date}`
})

const focusedTopicLabel = computed(() => {
  const slug = focusedThread.value?.primaryTopicSlug
  return (
    topics.value.find((topic) => topic.slug === slug)?.name || slug || t('signal.researchTopic')
  )
})

const pulseCards = computed(() =>
  pulseItems.value.map((item) => ({
    id: String(item.id),
    url: item.url,
    title: stripHtml(item.title),
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

async function openPulseEvidence() {
  showPulseEvidence.value = true
  await scrollToSection('signal-evidence')
}

async function readAaronsTake() {
  activeThreadSlug.value = focusedThread.value?.slug || ''
  await scrollToSection('signal-horizon')
}

async function openEvidenceWorkbench(topic = '') {
  activeTopic.value = topic
  activeSource.value = ''
  activeCategory.value = ''
  searchQuery.value = ''
  offset.value = 0
  await refreshSignalData()
  await scrollToSection('signal-workbench')
}
</script>

<template>
  <div class="signal-page">
    <main class="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16">
      <SignalHero
        :eyebrow="heroEyebrow"
        :headline="focusedThread?.title || t('signal.title')"
        :why-label="t('signal.whyItMatters')"
        :why-text="focusedThread?.builderImplication || t('signal.researchDeskDescription')"
        :evidence-label="t('signal.convergingEvidence')"
        :evidence-items="pulseCards"
        :more-evidence-label="t('signal.moreEvidence')"
        :topic-label="focusedTopicLabel"
        :thesis-label="t('signal.workingThesis')"
        :thesis="focusedThread ? firstSentence(focusedThread.thesis) : t('signal.subtitle')"
        :explore-label="t('signal.exploreEvidence')"
        :read-take-label="t('signal.readAaronsTake')"
        @explore="openPulseEvidence"
        @read-take="readAaronsTake"
      />

      <SignalPulse
        :open="showPulseEvidence"
        :pulse-text="pulseText"
        :pulse-date="pulseDate ? formatDisplayDate(pulseDate, true) : null"
        :heading="t('signal.evidenceBehindFocus')"
        :description="t('signal.evidenceBehindFocusDescription')"
        :machine-label="t('signal.machineReadout')"
        :evidence-label="t('signal.pulseEvidenceLabel')"
        :close-label="t('signal.close')"
        :full-evidence-label="t('signal.openWorkbench')"
        :pulse-cards="pulseCards"
        @close="showPulseEvidence = false"
        @open-workbench="openEvidenceWorkbench()"
      />

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
              type="search"
              :value="searchQuery"
              :placeholder="t('signal.searchEvidence')"
              class="signal-control form-input w-full rounded-lg py-2.5 pl-10 pr-3 text-sm"
              @input="onSearch(($event.target as HTMLInputElement).value)"
            />
          </label>

          <label>
            <span class="sr-only">{{ t('signal.sourceFilter') }}</span>
            <select
              :value="activeSource"
              class="signal-control form-select w-full rounded-lg py-2.5 text-sm"
              @change="setSource(($event.target as HTMLSelectElement).value)"
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
              :value="activeCategory"
              class="signal-control form-select w-full rounded-lg py-2.5 text-sm"
              @change="setCategory(($event.target as HTMLSelectElement).value)"
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
              :value="activeTopic"
              class="signal-control form-select w-full rounded-lg py-2.5 text-sm"
              @change="setTopic(($event.target as HTMLSelectElement).value)"
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
            class="signal-row group grid gap-3 px-5 py-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--signal-accent)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:px-6 sm:py-6"
          >
            <span class="min-w-0">
              <span
                class="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground opacity-75"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="sourceDotClass(item.source)" />
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
              </span>
              <span
                v-if="getSummary(item)"
                class="mt-2 line-clamp-2 block max-w-4xl text-sm leading-6 text-muted-foreground"
              >
                {{ getSummary(item)!.text }}
              </span>
            </span>
            <Icon
              name="heroicons:arrow-up-right"
              class="h-4 w-4 text-muted-foreground opacity-50 transition-colors group-hover:text-[var(--signal-accent)] group-hover:opacity-100"
            />
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
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            <Icon v-if="isLoadingMore" name="svg-spinners:180-ring" class="h-4 w-4" />
            {{ isLoadingMore ? t('signal.loading') : t('signal.loadMore') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
