<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

useHead({
  title: 'Signal',
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
  description: 'What I\'m reading. Noise removed.',
})

// Filter state
const activeSource = ref('')
const activeCategory = ref('')
const searchQuery = ref('')
const offset = ref(0)

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
})

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

function loadMore() {
  offset.value += 50
  refresh()
}

// Helpers
function timeAgo(dateStr: string) {
  const now = new Date()
  const d = new Date(dateStr + 'Z')
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h'
  return Math.floor(diff / 86400) + 'd'
}

function sourceIcon(s: string) {
  const map: Record<string, string> = {
    hackernews: '🟧',
    'x-twitter': '𝕏',
    reddit: '🟣',
    producthunt: '🔶',
    github: '🐙',
  }
  return map[s] || '📰'
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

function relevanceColor(r: number) {
  if (r >= 8) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (r >= 5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

function categoryEmoji(c: string) {
  const map: Record<string, string> = {
    ai: '🤖',
    coding: '💻',
    indie: '🚀',
    fintech: '💰',
    general: '📰',
  }
  return map[c] || '📰'
}

const sources = ['hackernews', 'x-twitter', 'reddit', 'producthunt', 'github']
const categories = ['ai', 'coding', 'indie', 'fintech', 'general']
</script>

<template>
  <main class="container max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        {{ t('signal.title') }}
      </h1>
      <p class="text-muted-foreground">
        {{ t('signal.subtitle') }}
      </p>
      <p class="text-xs text-muted-foreground/60 mt-1">
        {{ t('signal.poweredBy') }}
      </p>
    </div>

    <!-- Source filters -->
    <div class="flex flex-wrap gap-2 mb-3">
      <button
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
        :class="activeSource === '' ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'"
        @click="setSource('')"
      >
        {{ t('signal.all') }}
      </button>
      <button
        v-for="s in sources"
        :key="s"
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
        :class="activeSource === s ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'"
        @click="setSource(s)"
      >
        {{ sourceIcon(s) }} {{ sourceLabel(s) }}
      </button>
    </div>

    <!-- Category filters -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
        :class="activeCategory === '' ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'"
        @click="setCategory('')"
      >
        {{ t('signal.allTopics') }}
      </button>
      <button
        v-for="c in categories"
        :key="c"
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
        :class="activeCategory === c ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'"
        @click="setCategory(c)"
      >
        {{ categoryEmoji(c) }} {{ c }}
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        type="text"
        :placeholder="t('signal.search')"
        class="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:border-primary"
        @input="onSearch(($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Stats -->
    <div v-if="data?.stats" class="flex gap-4 text-xs text-muted-foreground mb-6">
      <span>{{ data.total }} {{ t('signal.items') }}</span>
      <span v-for="s in (data.stats as any[])" :key="s.source">
        {{ sourceIcon(s.source) }} {{ s.count }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="text-center py-16 text-muted-foreground">
      {{ t('signal.loading') }}
    </div>

    <!-- Items -->
    <div v-else-if="data?.items && (data.items as any[]).length > 0" class="flex flex-col">
      <article
        v-for="item in (data.items as any[])"
        :key="item.id"
        class="py-4 border-b border-border/50 hover:bg-secondary/30 -mx-4 px-4 rounded-lg transition-colors"
      >
        <!-- Meta row -->
        <div class="flex items-center gap-2 mb-1.5 text-xs">
          <span>{{ sourceIcon(item.source) }}</span>
          <span
            class="px-1.5 py-0.5 rounded text-[10px] font-bold border"
            :class="relevanceColor(item.relevance)"
          >
            {{ item.relevance }}
          </span>
          <span class="text-muted-foreground uppercase tracking-wider">{{ item.category }}</span>
          <span class="text-muted-foreground/50">{{ timeAgo(item.created_at) }}</span>
          <span v-if="item.score" class="text-orange-400">⬆{{ item.score.toLocaleString() }}</span>
        </div>

        <!-- Title -->
        <h3 class="text-sm font-medium leading-snug">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener"
            class="hover:text-primary transition-colors"
          >
            {{ item.title }}
          </a>
        </h3>

        <!-- Summary -->
        <p v-if="item.summary" class="text-xs text-muted-foreground mt-1 line-clamp-2">
          {{ item.summary }}
        </p>

        <!-- Author -->
        <span v-if="item.author" class="text-[11px] text-muted-foreground/60 mt-1">
          {{ item.author }}
        </span>
      </article>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16 text-muted-foreground">
      {{ t('signal.empty') }}
    </div>

    <!-- Load more -->
    <div v-if="data && (offset + 50) < Number(data.total)" class="text-center py-6">
      <button
        class="px-6 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
        @click="loadMore"
      >
        {{ t('signal.loadMore') }}
      </button>
    </div>

    <!-- About section -->
    <div class="mt-12 pt-8 border-t border-border/50">
      <h2 class="text-lg font-semibold mb-2">
        {{ t('signal.whatIsThis') }}
      </h2>
      <p class="text-sm text-muted-foreground leading-relaxed">
        {{ t('signal.whatIsThisDesc') }}
      </p>
    </div>
  </main>
</template>
