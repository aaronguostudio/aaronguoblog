<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { youtubeChannels } from '~/data/channels'
import youtubeData from '~/data/youtube.json'

const { t, locale } = useI18n()
const route = useRoute()

type VideoFormat = 'videos' | 'shorts'

type ChannelVideo = {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  durationSeconds: number
  viewCount: number
}

type ChannelLibrary = {
  channel: {
    subscriberCount: number
    viewCount: number
    videoCount: number
  }
  videos: ChannelVideo[]
  shorts: ChannelVideo[]
}

const libraries: Record<string, ChannelLibrary> = youtubeData.channels
const channels = youtubeChannels.map((channel) => ({
  ...channel,
  library: libraries[channel.id === 'drum' ? 'drumnext' : channel.id],
}))

const { data: premiere } = await useFetch('/api/latest-ai-brief')

useHead({
  title: t('videos.title'),
  meta: [{ name: 'description', content: t('videos.description') }],
})

defineOgImageComponent('About', {
  headline: 'Videos',
  title: t('videos.title'),
  description: t('videos.description'),
})

const chunkSize = 6
const activeChannelId = ref(channels[0].id)
const activeFormat = ref<VideoFormat>('videos')
const visibleCount = ref(chunkSize)
const releaseList = ref<HTMLUListElement | null>(null)
const channelHeading = ref<HTMLHeadingElement | null>(null)

const activeChannel = computed(
  () => channels.find((channel) => channel.id === activeChannelId.value) ?? channels[0],
)
const formats = computed(() => {
  const library = activeChannel.value.library
  const options: { id: VideoFormat; label: string }[] = [
    { id: 'videos', label: t('videos.fullLength') },
    { id: 'shorts', label: t('drum.shorts') },
  ]
  return options.filter(({ id }) => library?.[id].length)
})

const currentFormat = computed(
  () =>
    formats.value.find(({ id }) => id === activeFormat.value)?.id ??
    formats.value[0]?.id ??
    'videos',
)
const channelVideos = computed(() => activeChannel.value.library?.[currentFormat.value] ?? [])
const channelStats = computed(() => {
  const stats = activeChannel.value.library?.channel
  return stats
    ? [
        { label: t('drum.subscribers'), value: stats.subscriberCount },
        { label: t('drum.totalViews'), value: stats.viewCount },
        { label: t('drum.totalVideos'), value: stats.videoCount },
      ]
    : []
})
const visibleVideos = computed(() => channelVideos.value.slice(0, visibleCount.value))

function selectFormat(format: VideoFormat) {
  activeFormat.value = format
  visibleCount.value = chunkSize
}

function selectChannel(channelId: string) {
  if (activeChannelId.value === channelId) return

  activeChannelId.value = channelId
  selectFormat('videos')
}

// Prerendered pages share the default channel. Read the URL once the page has hydrated.
onMounted(() => {
  watch(
    () => route.query.channel,
    async (requestedId) => {
      const channel = channels.find(({ id }) => id === requestedId)
      selectChannel(channel?.id ?? channels[0].id)

      // The section may not exist when the router first tries to scroll to the hash.
      if (route.hash === '#video-channel-heading') {
        await nextTick()
        channelHeading.value?.scrollIntoView({ block: 'start' })
      }
    },
    { immediate: true },
  )
})

async function showMore() {
  const firstNewIndex = visibleVideos.value.length
  visibleCount.value += chunkSize
  await nextTick()
  releaseList.value?.children[firstNewIndex]?.querySelector('a')?.focus()
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Edmonton',
  }).format(new Date(value))

const formatNumber = (value: number) => new Intl.NumberFormat(locale.value).format(value)

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = String(seconds % 60).padStart(2, '0')
  if (minutes < 60) return `${minutes}:${remainder}`

  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${remainder}`
}

const getVideoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
</script>

<template>
  <main class="videos-page mx-auto max-w-[90rem] px-4 pb-16 pt-5 sm:px-8 sm:pt-8 lg:px-12 xl:px-16">
    <h1
      class="border-b border-[var(--line-subtle)] pb-3 text-3xl font-semibold tracking-tight text-foreground sm:pb-4 sm:text-4xl"
    >
      {{ t('videos.title') }}
    </h1>

    <section v-if="premiere" aria-labelledby="video-premiere-title">
      <a
        :href="getVideoUrl(premiere.id)"
        target="_blank"
        rel="noopener noreferrer"
        aria-labelledby="video-premiere-title video-premiere-watch"
        class="video-premiere group grid items-center gap-5 border-b border-[var(--line-subtle)] py-5 sm:gap-8 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] md:py-7 lg:gap-12"
      >
        <div class="min-w-0">
          <p class="video-kicker text-xs font-semibold uppercase tracking-[0.12em]">The AI Brief</p>
          <h2 id="video-premiere-title" class="video-premiere-title mt-2 sm:mt-3">
            {{ premiere.headline }}
          </h2>
          <p
            class="mt-3 flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground sm:mt-4 sm:text-base"
          >
            <time :datetime="premiere.publishedAt">{{ formatDate(premiere.publishedAt) }}</time>
            <template v-if="premiere.durationSeconds > 0">
              <span aria-hidden="true">·</span>
              <span class="tabular-nums">{{ formatDuration(premiere.durationSeconds) }}</span>
            </template>
          </p>
          <span
            id="video-premiere-watch"
            class="video-watch mt-4 inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors sm:mt-6"
          >
            <Icon name="heroicons:play-solid" class="h-4 w-4" />
            {{ t('drum.watchOnYouTube') }}
          </span>
        </div>
        <img
          :src="premiere.thumbnail"
          alt=""
          width="1280"
          height="720"
          fetchpriority="high"
          class="order-first aspect-video w-full rounded-lg bg-muted object-contain md:order-none"
        />
      </a>
    </section>

    <section aria-labelledby="video-channel-heading" class="pt-5 sm:pt-6">
      <h2
        id="video-channel-heading"
        ref="channelHeading"
        class="scroll-mt-24 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {{ t('videos.channelLineup') }}
      </h2>
      <div
        class="mt-2 grid grid-cols-3 divide-x divide-[var(--line-subtle)] border-b border-[var(--line-subtle)]"
      >
        <button
          v-for="channel in channels"
          :key="channel.id"
          type="button"
          :aria-pressed="activeChannelId === channel.id"
          :aria-label="t('videos.selectChannel', { channel: t(channel.nameKey) })"
          aria-controls="video-channel-library"
          class="video-channel-option relative flex min-w-0 flex-col items-center justify-start gap-2 px-2 py-3 text-center text-xs font-semibold text-foreground transition-colors sm:flex-row sm:justify-start sm:gap-3 sm:px-4 sm:py-3 sm:text-left sm:text-sm lg:text-base"
          @click="selectChannel(channel.id)"
        >
          <img
            v-if="channel.logo"
            :src="channel.logo"
            width="44"
            height="44"
            alt=""
            class="h-9 w-9 shrink-0 rounded-full bg-muted object-cover sm:h-11 sm:w-11"
          />
          <span
            v-else
            class="grid h-9 w-9 place-items-center rounded-full bg-muted sm:h-11 sm:w-11"
          >
            <Icon :name="channel.icon" class="h-5 w-5" />
          </span>
          <span>{{ t(channel.nameKey) }}</span>
          <span class="ml-auto hidden shrink-0 text-muted-foreground md:block">
            <Icon name="heroicons:chevron-right" class="h-4 w-4" />
          </span>
        </button>
      </div>

      <section
        id="video-channel-library"
        aria-labelledby="video-channel-title"
        class="mt-4 sm:mt-6"
      >
        <div
          class="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-[var(--line-subtle)] sm:gap-x-7"
        >
          <h3
            id="video-channel-title"
            aria-live="polite"
            class="py-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            {{ t(activeChannel.nameKey) }}
          </h3>
          <div
            v-if="formats.length"
            class="order-last flex basis-full gap-4 sm:order-none sm:basis-auto"
          >
            <button
              v-for="format in formats"
              :key="format.id"
              type="button"
              :aria-pressed="currentFormat === format.id"
              aria-controls="video-releases"
              class="video-format inline-flex min-h-11 items-center border-b-2 border-transparent text-sm font-medium text-muted-foreground transition-colors"
              @click="selectFormat(format.id)"
            >
              {{ format.label }}
            </button>
          </div>
          <a
            :href="activeChannel.url"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-auto inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-sm"
          >
            {{ t('videos.openChannel') }}
            <Icon name="heroicons:arrow-up-right" class="h-3.5 w-3.5" />
          </a>
        </div>

        <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
          {{ t(activeChannel.descriptionKey) }}
        </p>

        <div id="video-releases" class="mt-2 sm:mt-3">
          <ul
            v-if="visibleVideos.length"
            ref="releaseList"
            :key="`${activeChannelId}-${currentFormat}`"
            class="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            <li v-for="video in visibleVideos" :key="video.id">
              <a
                :href="getVideoUrl(video.id)"
                target="_blank"
                rel="noopener noreferrer"
                class="video-release group flex min-h-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors sm:gap-4"
              >
                <div
                  class="relative shrink-0 overflow-hidden rounded-md bg-muted"
                  :class="
                    currentFormat === 'shorts'
                      ? 'aspect-[9/16] w-16 sm:w-[4.5rem]'
                      : 'aspect-video w-[6.5rem] sm:w-[7.25rem]'
                  "
                >
                  <img
                    :src="video.thumbnail"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    :width="currentFormat === 'shorts' ? 72 : 160"
                    :height="currentFormat === 'shorts' ? 128 : 90"
                    class="h-full w-full object-cover"
                  />
                  <span
                    v-if="video.durationSeconds > 0"
                    class="absolute bottom-1 right-1 rounded bg-black/85 px-1 py-0.5 text-[10px] tabular-nums text-white"
                    >{{ formatDuration(video.durationSeconds) }}</span
                  >
                </div>
                <div class="min-w-0">
                  <p
                    class="text-sm font-semibold leading-snug text-foreground underline-offset-4 group-hover:underline sm:text-base"
                  >
                    {{ video.title }}
                  </p>
                  <p
                    class="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-xs text-muted-foreground"
                  >
                    <time :datetime="video.publishedAt">{{ formatDate(video.publishedAt) }}</time>
                    <span aria-hidden="true">·</span>
                    <span>{{ formatNumber(video.viewCount) }} {{ t('drum.views') }}</span>
                  </p>
                </div>
              </a>
            </li>
          </ul>
          <p v-else class="py-8 text-sm text-muted-foreground">
            {{ t('drum.noVideos') }}
          </p>
          <button
            v-if="channelVideos.length > visibleVideos.length"
            type="button"
            class="video-more mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--line-subtle)] px-4 py-2 text-sm font-medium transition-colors"
            @click="showMore"
          >
            {{ t('videos.loadMore') }}
            <Icon name="heroicons:chevron-down" class="h-4 w-4" />
          </button>
        </div>

        <dl
          v-if="channelStats.length"
          class="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--line-subtle)] pt-3 text-xs text-muted-foreground"
        >
          <div v-for="stat in channelStats" :key="stat.label" class="flex items-baseline gap-1.5">
            <dt>{{ stat.label }}</dt>
            <dd class="font-semibold tabular-nums text-foreground">
              {{ formatNumber(stat.value) }}
            </dd>
          </div>
        </dl>
      </section>
    </section>
  </main>
</template>

<style scoped>
.videos-page {
  --video-accent: #915009;
  --video-warm-ink: var(--foreground);
  --video-glow: rgb(237 174 86 / 0.13);
  --video-tint: rgb(145 80 9 / 0.07);
  --video-watch-bg: #21180f;
  --video-watch-ink: #fff6e8;
}

:global(html.dark .videos-page) {
  --video-accent: #ffcb70;
  --video-warm-ink: #f8eee0;
  --video-glow: rgb(183 100 29 / 0.18);
  --video-tint: rgb(255 203 112 / 0.08);
  --video-watch-bg: #f7ebd8;
  --video-watch-ink: #1d160f;
}

.video-premiere {
  background: radial-gradient(ellipse at 57% 52%, var(--video-glow), transparent 72%);
}

.video-kicker {
  color: var(--video-accent);
}

.video-premiere-title {
  color: var(--video-warm-ink);
  font-family: Georgia, 'Songti SC', 'Noto Serif SC', serif;
  font-size: clamp(1.95rem, 4.4vw, 3.65rem);
  font-weight: 600;
  letter-spacing: -0.032em;
  line-height: 1.04;
  text-wrap: balance;
}

.video-watch {
  background-color: var(--video-watch-bg);
  color: var(--video-watch-ink);
}

.video-premiere:hover .video-watch,
.video-premiere:focus-visible .video-watch {
  background-color: color-mix(in srgb, var(--video-watch-bg) 90%, var(--video-accent));
}

.video-channel-option[aria-pressed='true'] {
  box-shadow: inset 0 -2px var(--video-accent);
}

.video-channel-option:hover,
.video-channel-option[aria-pressed='true'],
.video-release:hover,
.video-more:hover {
  background-color: var(--video-tint);
}

.video-format:hover,
.video-format[aria-pressed='true'] {
  color: var(--foreground);
}

.video-format[aria-pressed='true'] {
  border-color: var(--video-accent);
}
</style>
