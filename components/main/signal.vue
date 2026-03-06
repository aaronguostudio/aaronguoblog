<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const localePath = useLocalePath()

const tooltipOpen = ref(false)

function openTooltip() {
  tooltipOpen.value = true
}

function closeTooltip() {
  tooltipOpen.value = false
}

function toggleTooltip(e: Event) {
  e.stopPropagation()
  tooltipOpen.value = !tooltipOpen.value
}

onMounted(() => {
  document.addEventListener('click', closeTooltip)
})

onUnmounted(() => {
  document.removeEventListener('click', closeTooltip)
})

// Fetch dynamic pulse data
const { data: pulseData } = await useFetch('/api/signal-pulse')

// Fallback to regular signal API if pulse has no items
const { data: fallbackData } = await useFetch('/api/signal', {
  query: { limit: 20, minRelevance: 7 },
})

const pulseText = computed(() => {
  return pulseData.value?.pulse || t('signal.pulse')
})

// Sort by relevance desc, take top 3
const topItems = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pulseItems = (pulseData.value?.items as Record<string, any>[]) || []
  if (pulseItems.length > 0) return pulseItems.slice(0, 3)
  // Fallback
  const items = (fallbackData.value?.items as Record<string, any>[]) || []
  return [...items].sort((a, b) => Number(b.relevance) - Number(a.relevance)).slice(0, 3)
})

function sourceColor(s: string) {
  const map: Record<string, string> = {
    hackernews: 'bg-orange-400',
    'x-twitter': 'bg-foreground',
    reddit: 'bg-purple-500',
    producthunt: 'bg-amber-500',
    github: 'bg-pink-500',
    lobsters: 'bg-red-400',
    arxiv: 'bg-cyan-400',
  }
  return map[s] || 'bg-muted-foreground'
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
    <!-- Gradient border wrapper -->
    <div
      class="rounded-xl p-[1px] bg-gradient-to-br from-cyan-500/30 via-border/30 to-violet-500/20 dark:from-cyan-400/25 dark:via-white/[0.06] dark:to-violet-500/20"
    >
      <section class="w-full rounded-xl bg-card overflow-hidden relative">
        <!-- Top ambient glow -->
        <div
          class="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none"
        />

        <!-- Header -->
        <div
          class="relative flex items-center justify-between px-4 py-3 border-b border-border/20 dark:border-white/[0.07]"
        >
          <div class="flex items-center gap-2">
            <span
              class="text-[10px] font-mono uppercase tracking-widest bg-gradient-to-r from-cyan-600 to-violet-600 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent select-none"
            >
              {{ t('navigation.signal') }}
            </span>
            <!-- Enhanced live dot -->
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"
              />
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                style="box-shadow: 0 0 6px rgb(52 211 153 / 0.8)"
              />
            </span>
            <!-- Info icon -->
            <button
              class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-muted-foreground/25 text-[9px] font-mono text-muted-foreground/40 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:border-cyan-400/50 dark:hover:text-cyan-400 transition-colors leading-none"
              :aria-label="t('signal.whatIsThis')"
              @mouseenter="openTooltip"
              @mouseleave="closeTooltip"
              @click="toggleTooltip"
            >
              ?
            </button>
          </div>
          <NuxtLink
            :to="localePath('/signal')"
            class="text-[10px] font-mono text-muted-foreground/30 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            {{ t('signal.viewAll') }} →
          </NuxtLink>
        </div>

        <!-- Pulse summary -->
        <div
          class="px-4 py-3 border-b border-border/20 dark:border-white/[0.07] bg-cyan-500/[0.03] dark:bg-cyan-400/[0.05]"
        >
          <p class="text-sm text-muted-foreground/70 leading-snug line-clamp-2">
            <span
              class="inline-block text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300 bg-gradient-to-r from-cyan-500/15 to-violet-500/10 dark:from-cyan-400/20 dark:to-violet-500/15 border border-cyan-500/20 dark:border-cyan-400/20 px-1.5 pt-0.5 rounded select-none mr-2"
              style="vertical-align: text-top"
              >{{ t('signal.todaysPulse') }}</span
            >{{ pulseText }}
          </p>
        </div>

        <!-- Top items -->
        <div>
          <a
            v-for="item in topItems"
            :key="item.id"
            :href="item.url"
            target="_blank"
            rel="noopener"
            class="group flex items-center gap-3 px-4 py-2.5 border-b border-border/20 dark:border-white/[0.07] last:border-0 hover:bg-cyan-500/[0.04] dark:hover:bg-cyan-400/[0.06] transition-colors"
          >
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="sourceColor(item.source)" />
            <span
              class="text-xs text-foreground/75 group-hover:text-foreground transition-colors leading-snug line-clamp-1"
            >
              {{ stripHtml(item.title) }}
            </span>
          </a>
        </div>
      </section>
    </div>

    <!-- Tooltip: outside overflow-hidden section -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="tooltipOpen"
        class="absolute top-[44px] left-4 z-50 w-72 p-3 rounded-lg bg-popover border border-border/50 dark:border-white/[0.10] shadow-xl"
        @mouseenter="openTooltip"
        @mouseleave="closeTooltip"
        @click.stop
      >
        <p class="text-[11px] font-semibold text-foreground mb-1">{{ t('signal.whatIsThis') }}</p>
        <p class="text-xs text-muted-foreground leading-relaxed">
          {{ t('signal.whatIsThisDesc') }}
        </p>
      </div>
    </Transition>
  </div>
</template>
