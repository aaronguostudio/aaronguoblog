<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { StaticRadarItem } from '~/composables/useStaticRadarSnapshot'
import { SIGNAL_BRIEFS } from '~/data/signal/briefs'
import { SIGNAL_RESEARCH_THREADS } from '~/data/signal/threads'
import { formatSignalPulseText } from '~/utils/signal-pulse'
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

type LatestRadarRun = {
  completed_at?: string | null
  started_at?: string | null
}

type SignalResponse = {
  items?: SignalItem[]
  total?: number | string
  stats?: SignalStat[]
  topics?: RadarTopicOption[]
  latestRun?: LatestRadarRun | null
}

type SignalPulseResponse = {
  pulse?: string | null
  date?: string | null
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
  title: 'Signal — AI-Curated Feed',
  description: "What I'm reading. Noise removed.",
})

// Filter state
const activeSource = ref('')
const activeCategory = ref('')
const activeTopic = ref('')
const searchQuery = ref('')
const offset = ref(0)

// Accumulated items for infinite scroll
const allItems = ref<SignalItem[]>([])
const totalCount = ref(0)
const statsData = ref<SignalStat[] | null>(null)

// Static snapshot is the SSG path. API fetches remain as a development/runtime fallback.
const { data: staticSnapshot } = await useStaticRadarSnapshot('signal-radar-latest')

const hasStaticSnapshot = computed(() => Boolean(staticSnapshot.value?.items?.length))
const shouldFetchApi = !staticSnapshot.value?.items?.length

// Fetch pulse data
const { data: pulseData } = await useFetch<SignalPulseResponse>('/api/signal-pulse', {
  immediate: shouldFetchApi,
})

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
    created_at: item.createdAt || item.publishedAt || staticSnapshot.value?.generatedAt || '',
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

const rawPulseText = computed(
  () => staticSnapshot.value?.pulse?.text || pulseData.value?.pulse || null,
)
const pulseText = computed(() =>
  formatSignalPulseText({
    text: rawPulseText.value,
    locale: locale.value,
  }),
)
const pulseDate = computed(() => staticSnapshot.value?.pulse?.date || pulseData.value?.date || null)
const pulseItems = computed(() => {
  if (hasStaticSnapshot.value) return getStaticPulseItems()
  const items = pulseData.value?.items || []
  return items.slice(0, 5)
})

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

// Fetch data
const {
  data,
  refresh: refreshApi,
  status,
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
  immediate: shouldFetchApi,
  watch: false,
  onResponse({ response }) {
    const result = response._data
    if (!result) return
    const nextItems = result.items || []
    if (offset.value === 0) {
      allItems.value = sortRadarItemsByDateDesc(nextItems)
    } else {
      allItems.value = sortRadarItemsByDateDesc([...allItems.value, ...nextItems])
    }
    totalCount.value = Number(result.total) || 0
    if (result.stats) statsData.value = result.stats
  },
})

async function refreshSignalData() {
  if (hasStaticSnapshot.value) {
    applyStaticFilters()
    return
  }

  await refreshApi()
}

// Init from SSR data
if (hasStaticSnapshot.value) {
  applyStaticFilters()
} else if (data.value) {
  allItems.value = data.value.items || []
  totalCount.value = Number(data.value.total) || 0
  statsData.value = data.value.stats || null
}

// Debounced search
let searchTimer: ReturnType<typeof setTimeout>
function onSearch(val: string) {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = val
    offset.value = 0
    refreshSignalData()
  }, 300)
}

function setSource(s: string) {
  activeSource.value = s
  offset.value = 0
  refreshSignalData()
}

function setCategory(c: string) {
  activeCategory.value = c
  offset.value = 0
  refreshSignalData()
}

function setTopic(topic: string) {
  activeTopic.value = topic
  offset.value = 0
  refreshSignalData()
}

const isLoadingMore = ref(false)
async function loadMore() {
  offset.value += 50
  isLoadingMore.value = true
  if (hasStaticSnapshot.value) {
    applyStaticFilters({ append: true })
  } else {
    await refreshApi()
  }
  isLoadingMore.value = false
}

// Helpers
function getSummary(item: SignalItem): { text: string; isAi: boolean } | null {
  const title = stripHtml(item.title).toLowerCase()
  const ai = item.ai_summary ? stripHtml(item.ai_summary) : ''
  const regular = item.summary ? stripHtml(item.summary) : ''

  // Prefer ai_summary, fallback to summary
  if (ai && !isDuplicate(ai, title)) return { text: ai, isAi: true }
  if (regular && !isDuplicate(regular, title)) return { text: regular, isAi: false }
  return null
}

function isDuplicate(summary: string, title: string): boolean {
  const s = summary.toLowerCase().trim()
  const t = title.trim()
  // Skip if summary is essentially the same as the title
  if (s === t) return true
  if (s.startsWith(t) && s.length < t.length * 1.3) return true
  if (t.startsWith(s) && t.length < s.length * 1.3) return true
  return false
}

function stripHtml(str: string) {
  if (!str) return ''
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim()
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateStr) ? dateStr : `${dateStr}Z`
  const d = new Date(normalized)
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h'
  return Math.floor(diff / 86400) + 'd'
}

function sourceColor(s: string) {
  const map: Record<string, string> = {
    hackernews: 'border-l-orange-400',
    'x-twitter': 'border-l-foreground',
    x: 'border-l-foreground',
    reddit: 'border-l-purple-500',
    producthunt: 'border-l-amber-500',
    github: 'border-l-pink-500',
    lobsters: 'border-l-red-400',
    arxiv: 'border-l-cyan-400',
    youtube: 'border-l-red-500',
    tiktok: 'border-l-sky-500',
    instagram: 'border-l-fuchsia-500',
    polymarket: 'border-l-blue-500',
    web: 'border-l-emerald-500',
  }
  return map[s] || 'border-l-muted-foreground'
}

function sourceBg(s: string) {
  const map: Record<string, string> = {
    hackernews: 'bg-orange-500',
    'x-twitter': 'bg-foreground',
    x: 'bg-foreground',
    reddit: 'bg-purple-500',
    producthunt: 'bg-amber-500',
    github: 'bg-pink-500',
    lobsters: 'bg-red-400',
    arxiv: 'bg-cyan-400',
    youtube: 'bg-red-500',
    tiktok: 'bg-sky-500',
    instagram: 'bg-fuchsia-500',
    polymarket: 'bg-blue-500',
    web: 'bg-emerald-500',
  }
  return map[s] || 'bg-muted-foreground'
}

function sourceLabel(s: string) {
  const map: Record<string, string> = {
    hackernews: 'HN',
    'x-twitter': 'X',
    x: 'X',
    reddit: 'Reddit',
    producthunt: 'PH',
    github: 'GitHub',
    lobsters: 'Lobsters',
    arxiv: 'ArXiv',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    polymarket: 'Polymarket',
    web: 'Web',
  }
  return map[s] || s
}

function categoryLabel(c: string) {
  const map: Record<string, string> = {
    ai: 'AI',
    coding: 'Code',
    indie: 'Indie',
    fintech: 'Fintech',
    management: 'Mgmt',
    content: 'Content',
    general: 'General',
  }
  return map[c] || c
}

function categoryColor(c: string) {
  const map: Record<string, string> = {
    ai: 'text-blue-500 bg-blue-500/10',
    coding: 'text-emerald-500 bg-emerald-500/10',
    indie: 'text-violet-500 bg-violet-500/10',
    fintech: 'text-amber-500 bg-amber-500/10',
    management: 'text-orange-500 bg-orange-500/10',
    content: 'text-pink-500 bg-pink-500/10',
    general: 'text-muted-foreground bg-muted',
  }
  return map[c] || 'text-muted-foreground bg-muted'
}

const sources = [
  'hackernews',
  'x-twitter',
  'x',
  'reddit',
  'producthunt',
  'github',
  'lobsters',
  'arxiv',
  'youtube',
  'tiktok',
  'instagram',
  'polymarket',
  'web',
]
const categories = ['ai', 'coding', 'indie', 'fintech', 'management', 'content', 'general']

const topics = computed(() => {
  const apiTopics = staticSnapshot.value?.topics || data.value?.topics || []
  return apiTopics.map((topic) => ({
    slug: topic.slug,
    name: topic.name,
  }))
})

const latestRun = computed(() => {
  if (staticSnapshot.value?.latestRun) {
    return {
      completed_at: staticSnapshot.value.latestRun.completedAt,
      started_at: staticSnapshot.value.latestRun.startedAt,
    }
  }
  return data.value?.latestRun || null
})

const totalStats = computed(() => {
  if (!statsData.value) return 0
  return statsData.value.reduce((sum, s) => sum + Number(s.count), 0)
})

const sourceMixRows = computed(() => {
  const total = Number(totalStats.value) || 0
  return (statsData.value || []).slice(0, 8).map((stat) => {
    const count = Number(stat.count) || 0
    return {
      source: stat.source,
      label: sourceLabel(stat.source),
      count: String(count),
      percent: total > 0 ? Math.max(4, Math.round((count / total) * 100)) : 4,
      colorClass: sourceBg(stat.source),
    }
  })
})

// Research threads should match against the unfiltered static snapshot, not visible filters.
const researchSignalItems = computed(() => {
  if (hasStaticSnapshot.value) return getStaticItems()
  return allItems.value
})

const threadCards = computed(() =>
  createSignalThreadCards({
    threads: SIGNAL_RESEARCH_THREADS,
    items: researchSignalItems.value,
    locale: locale.value,
  }),
)

const briefCards = computed(() =>
  createSignalBriefCards({
    briefs: SIGNAL_BRIEFS,
    locale: locale.value,
  }),
)

const heroMetrics = computed(() => [
  {
    label: t('signal.metricSignals'),
    value: String(totalStats.value || totalCount.value || 0),
    caption: t('signal.metricSignalsCaption'),
  },
  {
    label: t('signal.metricThreads'),
    value: String(threadCards.value.length),
    caption: t('signal.metricThreadsCaption'),
  },
  {
    label: t('signal.metricBriefs'),
    value: String(briefCards.value.length),
    caption: t('signal.metricBriefsCaption'),
  },
])

const heroStatusLabel = computed(() => {
  if (latestRun.value?.completed_at || latestRun.value?.started_at) {
    return `${t('signal.updated')} ${timeAgo(
      latestRun.value.completed_at || latestRun.value.started_at || '',
    )}`
  }
  return t('signal.snapshotReady')
})

const heroPromises = computed(() => [
  t('signal.heroPromiseEvidence'),
  t('signal.heroPromiseInterpretation'),
  t('signal.heroPromiseProducts'),
])

const pulseCards = computed(() =>
  pulseItems.value.map((item) => ({
    id: String(item.id),
    url: item.url,
    title: stripHtml(item.title),
    sourceLabel: sourceLabel(item.source),
    categoryLabel: categoryLabel(item.category),
    sourceClass: sourceBg(item.source),
    categoryClass: categoryColor(item.category),
  })),
)
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <SignalHero
      :title="t('signal.title')"
      :eyebrow="t('signal.heroEyebrow')"
      :description="t('signal.researchDeskDescription')"
      :status-label="heroStatusLabel"
      :live-label="t('signal.liveLabel')"
      :operations-label="t('signal.operationsLabel')"
      :source-mix-label="t('signal.sourceMixLabel')"
      :pulse-date-label="t('signal.pulseDateLabel')"
      :pulse-date="pulseDate"
      :promises="heroPromises"
      :metrics="heroMetrics"
      :source-mix-rows="sourceMixRows"
    />

    <SignalPulse
      :pulse-text="pulseText"
      :pulse-date="pulseDate"
      :daily-readout-label="t('signal.dailyReadoutLabel')"
      :heading="t('signal.todaysPulse')"
      :description="t('signal.pulseDescription')"
      :evidence-label="t('signal.pulseEvidenceLabel')"
      :pulse-cards="pulseCards"
    />

    <SignalResearchThreads
      :threads="threadCards"
      :heading="t('signal.watchingTitle')"
      :description="t('signal.watchingDescription')"
      :confidence-label="t('signal.confidence')"
      :active-thesis-label="t('signal.activeThesis')"
      :supporting-signals-label="t('signal.supportingSignals')"
      :more-signals-label="t('signal.moreSignals')"
      :question-label="t('signal.question')"
      :product-angle-label="t('signal.productAngle')"
    />

    <SignalBriefs
      :briefs="briefCards"
      :heading="t('signal.briefsTitle')"
      :description="t('signal.briefsDescription')"
      :latest-label="t('signal.briefsLatest')"
      :related-thread-label="t('signal.relatedThread')"
      :weekly-brief-label="t('signal.weeklyBrief')"
      :funnel-label="t('signal.funnelLabel')"
      :signals-label="t('signal.funnelSignals')"
      :threads-label="t('signal.funnelThreads')"
      :brief-label="t('signal.funnelBrief')"
      :hypothesis-label="t('signal.funnelHypothesis')"
      :signals-distilled-label="t('signal.signalsDistilled')"
    />

    <section class="mt-12 border-t border-border/70 pt-8">
      <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {{ t('signal.evidenceEyebrow') }}
          </p>
          <h2 class="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
            {{ t('signal.evidenceTitle') }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground/70">
            {{ t('signal.evidenceDescription') }}
          </p>
        </div>
      </div>

      <!-- Toolbar -->
      <div
        class="sticky top-[5rem] z-40 -mx-2 mb-6 rounded-lg border border-border/60 bg-background/90 px-3 py-3 shadow-sm backdrop-blur-md sm:-mx-3 sm:px-4"
      >
        <div class="flex flex-col gap-2.5">
          <!-- Row 1: Sources + Search -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap"
                :class="
                  activeSource === ''
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                "
                @click="setSource('')"
              >
                {{ t('signal.all') }}
              </button>
              <button
                v-for="s in sources"
                :key="s"
                class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5"
                :class="
                  activeSource === s
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                "
                @click="setSource(s)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="sourceBg(s)" />
                {{ sourceLabel(s) }}
              </button>
            </div>

            <!-- Search -->
            <div class="relative ml-auto w-44 sm:w-56 shrink-0">
              <Icon
                name="heroicons:magnifying-glass"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50"
              />
              <input
                type="text"
                :placeholder="t('signal.search')"
                class="w-full pl-8 pr-3 py-1.5 rounded-md bg-secondary/50 border border-border/50 text-xs focus:outline-none focus:border-primary/50 focus:bg-secondary transition-all"
                @input="onSearch(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <!-- Row 2: Categories -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap"
              :class="
                activeCategory === ''
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              "
              @click="setCategory('')"
            >
              {{ t('signal.allTopics') }}
            </button>
            <button
              v-for="c in categories"
              :key="c"
              class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap"
              :class="
                activeCategory === c
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              "
              @click="setCategory(c)"
            >
              {{ categoryLabel(c) }}
            </button>
          </div>

          <!-- Row 3: Radar topics -->
          <div v-if="topics.length > 0" class="flex items-center gap-1.5 flex-wrap">
            <button
              class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap"
              :class="
                activeTopic === ''
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              "
              @click="setTopic('')"
            >
              {{ t('signal.allRadarTopics') }}
            </button>
            <button
              v-for="topic in topics"
              :key="topic.slug"
              class="px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap"
              :class="
                activeTopic === topic.slug
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              "
              @click="setTopic(topic.slug)"
            >
              {{ topic.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Count -->
      <div v-if="totalCount" class="flex items-center gap-2 mb-4">
        <span class="text-xs text-muted-foreground/60 font-mono">
          {{ totalCount }} {{ t('signal.items') }}
        </span>
        <span
          v-if="latestRun && (latestRun.completed_at || latestRun.started_at)"
          class="text-xs text-muted-foreground/40 font-mono"
        >
          {{ t('signal.updated') }} {{ timeAgo(latestRun.completed_at || latestRun.started_at) }}
        </span>
      </div>

      <!-- Loading (initial only) -->
      <div
        v-if="status === 'pending' && allItems.length === 0"
        class="flex items-center justify-center py-24"
      >
        <div class="flex flex-col items-center gap-3">
          <div
            class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
          />
          <span class="text-sm text-muted-foreground">{{ t('signal.loading') }}</span>
        </div>
      </div>

      <!-- Items -->
      <div v-else-if="allItems.length > 0" class="grid gap-3">
        <a
          v-for="item in allItems"
          :key="item.id"
          :href="item.url"
          target="_blank"
          rel="noopener"
          class="group block rounded-lg border border-l-2 border-border/60 bg-card/50 px-4 py-4 shadow-sm transition-colors duration-200 hover:bg-secondary/60"
          :class="sourceColor(item.source)"
        >
          <!-- Top row: meta -->
          <div class="flex items-center gap-2 mb-1">
            <span
              class="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              :class="categoryColor(item.category)"
            >
              {{ categoryLabel(item.category) }}
            </span>
            <span class="text-[11px] text-muted-foreground/40 font-mono">{{
              sourceLabel(item.source)
            }}</span>
            <span class="text-[11px] text-muted-foreground/30 font-mono">{{
              timeAgo(item.created_at)
            }}</span>
            <span v-if="item.score" class="text-[11px] text-muted-foreground/40 font-mono ml-auto">
              {{ item.score.toLocaleString() }} pts
            </span>
          </div>

          <!-- Title -->
          <h3
            class="text-base font-semibold leading-snug text-foreground group-hover:text-primary sm:text-lg"
          >
            {{ stripHtml(item.title) }}
          </h3>

          <!-- Summary -->
          <div v-if="getSummary(item)" class="flex items-start gap-1.5 mt-1.5">
            <Icon
              v-if="getSummary(item)!.isAi"
              name="heroicons:star-solid"
              class="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5"
              :title="t('signal.aiSummary')"
            />
            <p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground/55">
              {{ getSummary(item)!.text }}
            </p>
          </div>
        </a>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <div class="text-4xl mb-3 opacity-30">~</div>
        <p class="text-sm text-muted-foreground">{{ t('signal.empty') }}</p>
      </div>

      <!-- Load more -->
      <div v-if="allItems.length < totalCount" class="flex justify-center py-8">
        <button
          class="px-6 py-2 rounded-lg text-xs font-medium text-muted-foreground border border-border/50 hover:border-border hover:text-foreground transition-all flex items-center gap-2"
          :disabled="isLoadingMore"
          @click="loadMore"
        >
          <div
            v-if="isLoadingMore"
            class="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"
          />
          {{ isLoadingMore ? t('signal.loading') : t('signal.loadMore') }}
        </button>
      </div>
    </section>
  </main>
</template>
