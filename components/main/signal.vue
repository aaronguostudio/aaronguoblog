<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { StaticRadarItem, StaticRadarSnapshot } from '~/composables/useStaticRadarSnapshot'
import { extractRadarPulseThemes, selectPulseSnapshotItems } from '~/utils/radar-snapshot'

const { t } = useI18n()
const localePath = useLocalePath()

type SignalPreviewItem = {
  id?: number | string
  source: string
  title: string
  url: string
  relevance: number | string
  category?: string
  score?: number | string
}

type SignalPulseResponse = {
  pulse?: string | null
  items?: SignalPreviewItem[]
}

type SignalResponse = {
  items?: SignalPreviewItem[]
}

const props = defineProps<{
  snapshot?: StaticRadarSnapshot | null
}>()

const hasProvidedSnapshot = Boolean(props.snapshot?.items?.length)

const { data: fetchedStaticSnapshot } = await useStaticRadarSnapshot(
  'homepage-signal-radar-latest',
  { immediate: !hasProvidedSnapshot },
)

const staticSnapshot = computed(() => props.snapshot || fetchedStaticSnapshot.value)

const hasStaticSnapshot = computed(() => Boolean(staticSnapshot.value?.items?.length))
const shouldFetchApi = !staticSnapshot.value?.items?.length

// Fetch dynamic pulse data
const { data: pulseData } = await useFetch<SignalPulseResponse>('/api/signal-pulse', {
  immediate: shouldFetchApi,
})

// Fallback to regular signal API if pulse has no items
const { data: fallbackData } = await useFetch<SignalResponse>('/api/signal', {
  query: { limit: 20, minRelevance: 7 },
  immediate: shouldFetchApi,
})

const pulseText = computed(() => {
  return staticSnapshot.value?.pulse?.text || pulseData.value?.pulse || t('signal.pulse')
})

const pulseItems = computed(() => {
  if (hasStaticSnapshot.value) {
    const topIds = staticSnapshot.value?.pulse?.topItemIds || []
    return selectPulseSnapshotItems<StaticRadarItem>(
      staticSnapshot.value?.items || [],
      topIds,
      Math.max(topIds.length, 3),
    )
  }

  const dynamicPulseItems = pulseData.value?.items || []
  if (dynamicPulseItems.length > 0) return dynamicPulseItems

  const items = fallbackData.value?.items || []
  return [...items].sort((a, b) => Number(b.relevance) - Number(a.relevance))
})

const topItems = computed(() => pulseItems.value.slice(0, 3))

const pulseRead = computed(() => {
  return (
    extractRadarPulseThemes(pulseText.value) ||
    stripHtml(topItems.value[0]?.title || '') ||
    t('signal.pulse')
  )
})

function sourceColor(s: string) {
  const map: Record<string, string> = {
    hackernews: 'text-orange-400',
    'x-twitter': 'text-slate-200',
    x: 'text-slate-200',
    reddit: 'text-violet-400',
    producthunt: 'text-amber-400',
    github: 'text-pink-400',
    lobsters: 'text-red-400',
    arxiv: 'text-cyan-300',
    youtube: 'text-red-400',
    tiktok: 'text-sky-400',
    instagram: 'text-fuchsia-400',
    polymarket: 'text-blue-400',
    web: 'text-emerald-400',
  }
  return map[s] || 'text-slate-500'
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
</script>

<template>
  <div v-if="topItems.length > 0" class="relative w-full">
    <section
      class="overflow-hidden rounded-[1.25rem] border border-sky-400/55 bg-[#07101d] text-white shadow-[0_20px_45px_rgb(2_8_23_/_0.25)]"
    >
      <div class="px-5 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-sky-300">
              {{ t('navigation.signal') }}
            </span>
            <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
              <Icon
                name="mdi:circle"
                class="absolute h-2.5 w-2.5 animate-ping text-emerald-300/60 motion-reduce:animate-none"
              />
              <Icon name="mdi:circle" class="relative h-2.5 w-2.5 text-emerald-400" />
            </span>
            <span class="sr-only">{{ t('signal.previewDescription') }}</span>
          </div>
          <NuxtLink
            :to="localePath('/signal')"
            class="group -my-2 -mr-2 inline-flex min-h-11 items-center gap-1.5 px-2 font-mono text-[11px] tracking-[0.08em] text-sky-200/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:text-xs"
          >
            {{ t('signal.viewAll') }}
            <Icon
              name="heroicons:arrow-right"
              class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </NuxtLink>
        </div>

        <div class="mt-4 min-w-0 sm:mt-5">
          <p class="font-mono text-[10px] tracking-[0.1em] text-sky-300">
            {{ t('signal.dailyReadoutLabel') }}
          </p>
          <p
            class="mt-2 text-lg font-medium leading-[1.25] tracking-[-0.025em] text-white sm:text-[1.55rem]"
          >
            {{ pulseRead }}
          </p>
        </div>
      </div>

      <div class="border-t border-white/15 pb-2 sm:pb-3">
        <a
          v-for="item in topItems"
          :key="item.id"
          :href="item.url"
          target="_blank"
          rel="noopener"
          class="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-white/10 px-5 py-3 transition-colors hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300 sm:gap-x-4 sm:px-6 sm:py-3.5"
        >
          <Icon
            name="mdi:circle"
            class="h-2.5 w-2.5 shrink-0 self-center"
            :class="sourceColor(item.source)"
          />
          <span
            class="min-w-0 truncate text-sm leading-tight text-white/80 transition-colors group-hover:text-white sm:text-[0.95rem]"
          >
            {{ stripHtml(item.title) }}
          </span>
          <Icon
            name="heroicons:arrow-right"
            class="h-4 w-4 shrink-0 text-sky-300/75 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-sky-200"
          />
        </a>
      </div>
    </section>
  </div>
</template>
