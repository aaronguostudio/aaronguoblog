<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
const searchQuery = ref('')
const offset = ref(0)

// Accumulated items for infinite scroll
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allItems = ref<any[]>([])
const totalCount = ref(0)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statsData = ref<any[] | null>(null)

// Fetch data
const { data, refresh, status } = await useFetch('/api/signal', {
  query: computed(() => ({
    source: activeSource.value,
    category: activeCategory.value,
    minRelevance: 5,
    offset: offset.value,
    q: searchQuery.value,
    limit: 50,
  })),
  watch: false,
  onResponse({ response }) {
    const result = response._data
    if (!result) return
    if (offset.value === 0) {
      allItems.value = result.items || []
    } else {
      allItems.value = [...allItems.value, ...(result.items || [])]
    }
    totalCount.value = Number(result.total) || 0
    if (result.stats) statsData.value = result.stats
  },
})

// Init from SSR data
if (data.value) {
  allItems.value = (data.value.items as Record<string, unknown>[]) || []
  totalCount.value = Number(data.value.total) || 0
  statsData.value = (data.value.stats as Record<string, unknown>[]) || null
}

// Debounced search
let searchTimer: ReturnType<typeof setTimeout>
function onSearch(val: string) {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = val
    offset.value = 0
    refresh()
  }, 300)
}

function setSource(s: string) {
  activeSource.value = s
  offset.value = 0
  refresh()
}

function setCategory(c: string) {
  activeCategory.value = c
  offset.value = 0
  refresh()
}

const isLoadingMore = ref(false)
async function loadMore() {
  offset.value += 50
  isLoadingMore.value = true
  await refresh()
  isLoadingMore.value = false
}

// Helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSummary(item: Record<string, any>): { text: string; isAi: boolean } | null {
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
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim()
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const d = new Date(dateStr + 'Z')
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
    reddit: 'border-l-purple-500',
    producthunt: 'border-l-amber-500',
    github: 'border-l-pink-500',
  }
  return map[s] || 'border-l-muted-foreground'
}

function sourceBg(s: string) {
  const map: Record<string, string> = {
    hackernews: 'bg-orange-500',
    'x-twitter': 'bg-foreground',
    reddit: 'bg-purple-500',
    producthunt: 'bg-amber-500',
    github: 'bg-pink-500',
  }
  return map[s] || 'bg-muted-foreground'
}

function sourceLabel(s: string) {
  const map: Record<string, string> = {
    hackernews: 'HN',
    'x-twitter': 'X',
    reddit: 'Reddit',
    producthunt: 'PH',
    github: 'GitHub',
  }
  return map[s] || s
}

function categoryLabel(c: string) {
  const map: Record<string, string> = {
    ai: 'AI',
    coding: 'Code',
    indie: 'Indie',
    fintech: 'Fintech',
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
    general: 'text-muted-foreground bg-muted',
  }
  return map[c] || 'text-muted-foreground bg-muted'
}

const sources = ['hackernews', 'x-twitter', 'reddit', 'producthunt', 'github']
const categories = ['ai', 'coding', 'indie', 'fintech', 'general']

const totalStats = computed(() => {
  if (!statsData.value) return 0
  return statsData.value.reduce((sum: number, s: Record<string, unknown>) => sum + Number(s.count), 0)
})
</script>

<template>
  <main class="container max-w-5xl mx-auto px-4 py-8 sm:py-12">
    <!-- Hero -->
    <div class="relative mb-10 sm:mb-14">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
              {{ t('signal.title') }}
            </h1>
            <span class="relative flex h-2.5 w-2.5 mt-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
              />
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          </div>
          <p class="text-lg text-muted-foreground max-w-lg">
            {{ t('signal.subtitle') }}
          </p>
          <p class="text-sm text-muted-foreground/50 mt-3 max-w-lg leading-relaxed">
            {{ t('signal.poweredBy') }}
          </p>
        </div>

        <!-- Mini stats -->
        <div v-if="statsData" class="hidden sm:flex flex-col gap-1.5 text-right shrink-0">
          <div
            v-for="s in statsData"
            :key="(s as any).source"
            class="flex items-center gap-2 justify-end"
          >
            <span class="text-[11px] text-muted-foreground/70 font-mono w-6 text-right">{{
              s.count
            }}</span>
            <div class="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="sourceBg(s.source)"
                :style="{
                  width: `${Math.min((Number(s.count) / Number(totalStats)) * 100 * 2, 100)}%`,
                }"
              />
            </div>
            <span class="text-[11px] text-muted-foreground/50 font-mono w-10">{{
              sourceLabel(s.source)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div
      class="sticky top-[1rem] z-40 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md border border-border/50 mb-6 rounded-md"
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
      </div>
    </div>

    <!-- Count -->
    <div v-if="totalCount" class="flex items-center gap-2 mb-4">
      <span class="text-xs text-muted-foreground/60 font-mono">
        {{ totalCount }} {{ t('signal.items') }}
      </span>
    </div>

    <!-- Loading (initial only) -->
    <div v-if="status === 'pending' && allItems.length === 0" class="flex items-center justify-center py-24">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
        />
        <span class="text-sm text-muted-foreground">{{ t('signal.loading') }}</span>
      </div>
    </div>

    <!-- Items -->
    <div v-else-if="allItems.length > 0" class="flex flex-col gap-4">
      <a
        v-for="item in allItems"
        :key="item.id"
        :href="item.url"
        target="_blank"
        rel="noopener"
        class="group block border-l-2 pl-4 pr-3 py-4 rounded-r-lg transition-colors duration-200 hover:bg-secondary"
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
        <h3 class="text-base sm:text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
          {{ stripHtml(item.title) }}
        </h3>

        <!-- Summary -->
        <div
          v-if="getSummary(item)"
          class="flex items-start gap-1.5 mt-1.5"
        >
          <Icon v-if="getSummary(item)!.isAi" name="heroicons:star-solid" class="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" :title="t('signal.aiSummary')" />
          <p class="text-sm text-muted-foreground/45 line-clamp-2 leading-relaxed">
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
        <div v-if="isLoadingMore" class="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        {{ isLoadingMore ? t('signal.loading') : t('signal.loadMore') }}
      </button>
    </div>

  </main>
</template>
