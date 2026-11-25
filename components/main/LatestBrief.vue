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
      class="group grid overflow-hidden border-y border-[color:var(--line-subtle)] bg-card sm:grid-cols-[minmax(15rem,34%)_1fr] focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div class="relative aspect-video">
        <img :src="episode.thumbnail" alt="" class="h-full w-full object-cover" width="640" height="360">
        <span class="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-1 text-xs font-medium text-white">{{ duration }}</span>
      </div>
      <div class="flex flex-col justify-center gap-2 px-5 py-4 sm:px-8">
        <p class="text-sm font-medium text-muted-foreground">
          {{ t('home.latestBrief') }} · <time :datetime="episode.publishedAt">{{ date }}</time>
        </p>
        <h2 id="latest-brief-title" class="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{{ episode.headline }}</h2>
        <span class="mt-1 text-sm font-medium text-primary group-hover:underline">{{ t('home.watchBrief') }} →</span>
      </div>
    </a>
  </section>
</template>
