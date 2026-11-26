<script setup lang="ts">
import { useId } from 'vue'

const { t, locale } = useI18n()
const titleId = useId()
const destinationId = useId()
const { data: episode } = await useFetch('/api/latest-ai-brief')
const date = computed(
  () =>
    episode.value &&
    new Intl.DateTimeFormat(locale.value, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Edmonton',
    }).format(new Date(episode.value.publishedAt)),
)
const duration = computed(() => {
  const seconds = episode.value?.durationSeconds || 0
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
})
</script>

<template>
  <section v-if="episode" class="px-4 lg:px-0" :aria-labelledby="titleId">
    <a
      :href="'https://www.youtube.com/watch?v=' + episode.id"
      :aria-labelledby="titleId + ' ' + destinationId"
      class="group grid grid-cols-[var(--home-media-width)_minmax(0,1fr)] items-center gap-3 rounded-xl border border-border bg-card px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-primary sm:px-4 lg:py-2"
    >
      <div class="relative aspect-video overflow-hidden rounded-md bg-muted">
        <img
          :src="episode.thumbnail"
          alt=""
          class="h-full w-full object-cover"
          width="192"
          height="108"
        />
        <span
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            class="grid h-7 w-7 place-items-center rounded-full border border-white/80 bg-black/80 text-white transition-colors group-hover:bg-red-700 group-focus-visible:bg-red-700 lg:h-8 lg:w-8"
          >
            <Icon name="heroicons:play-solid" class="ml-0.5 h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </span>
        </span>
        <span
          class="absolute bottom-1 right-1 rounded bg-black/85 px-1 py-0.5 text-[10px] font-medium tabular-nums text-white"
          >{{ duration }}</span
        >
      </div>
      <div class="min-w-0 pr-1">
        <p
          class="relative flex flex-wrap items-baseline gap-x-2 pr-5 text-xs font-medium leading-4 text-muted-foreground"
        >
          <span>{{ t('home.latestBrief') }}</span>
          <time class="hidden sm:inline" :datetime="episode.publishedAt">{{ date }}</time>
          <Icon
            name="heroicons:arrow-up-right"
            aria-hidden="true"
            class="absolute right-0 top-px h-3.5 w-3.5"
          />
        </p>
        <h2
          :id="titleId"
          class="break-words text-base font-semibold leading-snug text-foreground underline-offset-4 group-hover:underline sm:text-lg lg:text-base"
        >
          {{ episode.headline }}
        </h2>
        <span :id="destinationId" class="sr-only">{{ t('home.watchBrief') }}</span>
      </div>
    </a>
  </section>
</template>
