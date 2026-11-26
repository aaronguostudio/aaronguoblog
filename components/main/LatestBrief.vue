<script setup lang="ts">
const { t, locale } = useI18n()
const { data: episode } = await useFetch('/api/latest-ai-brief')
const date = computed(() => episode.value && new Intl.DateTimeFormat(locale.value, {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Edmonton',
}).format(new Date(episode.value.publishedAt)))
const duration = computed(() => {
  const seconds = episode.value?.durationSeconds || 0
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
})
</script>

<template>
  <section v-if="episode" class="px-4" aria-labelledby="latest-brief-title">
    <a
      :href="'https://www.youtube.com/watch?v=' + episode.id"
      class="group grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 border-y border-[color:var(--line-subtle)] bg-card py-2 focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[11rem_minmax(0,1fr)]"
    >
      <div class="relative aspect-video overflow-hidden rounded-md bg-muted">
        <img :src="episode.thumbnail" alt="" class="h-full w-full object-cover" width="192" height="108">
        <span aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span class="grid h-7 w-7 place-items-center rounded-full border border-white/80 bg-black/80 text-white transition-colors group-hover:bg-red-700 group-focus-visible:bg-red-700 lg:h-10 lg:w-10">
            <Icon name="heroicons:play-solid" class="ml-0.5 h-3.5 w-3.5 lg:h-5 lg:w-5" />
          </span>
        </span>
        <span class="absolute bottom-1 right-1 rounded bg-black/85 px-1 py-0.5 text-[10px] font-medium tabular-nums text-white lg:px-1.5 lg:text-xs">{{ duration }}</span>
      </div>
      <div class="min-w-0 pr-1">
        <p class="flex flex-wrap items-baseline gap-x-2 text-xs font-medium leading-4 text-muted-foreground">
          <span class="font-semibold text-red-700 dark:text-red-300">{{ t('home.briefVideoLabel') }}</span>
          <span>{{ t('home.latestBrief') }}</span>
          <time class="hidden sm:inline" :datetime="episode.publishedAt">{{ date }}</time>
        </p>
        <h2 id="latest-brief-title" class="break-words text-base font-semibold leading-snug text-foreground sm:text-xl">{{ episode.headline }}</h2>
        <span class="block text-xs font-medium leading-4 text-primary group-hover:underline sm:text-sm">{{ t('home.watchBrief') }} →</span>
      </div>
    </a>
  </section>
</template>
