<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { youtubeChannels } from '~/data/channels'
import youtubeData from '~/data/youtube.json'

const { t, locale } = useI18n()

type YouTubeVideo = {
  id: string
  title: string
  thumbnail: string
  thumbnailWidth?: number
  thumbnailHeight?: number
  thumbnailQuality?: string
  publishedAt: string
  durationSeconds: number
  viewCount: number
}

type YouTubeChannelData = {
  channel: {
    subscriberCount: number
    videoCount: number
    viewCount: number
  }
  videos: YouTubeVideo[]
  shorts: YouTubeVideo[]
}

type YouTubeData = {
  channels: Record<string, YouTubeChannelData>
  metadata: {
    fetchedAt?: string
  }
}

type ChannelTab = {
  key: string
  channelId: string
  nameKey: string
  descriptionKey: string
  icon: string
}

const typedYoutubeData = youtubeData as YouTubeData

useHead({
  title: t('videos.title'),
  meta: [
    {
      name: 'description',
      content: t('videos.description'),
    },
  ],
})

defineOgImageComponent('About', {
  headline: 'Videos',
  title: t('videos.title'),
  description: t('videos.description'),
})

const tabs: ChannelTab[] = [
  {
    key: 'ai-native-builder',
    channelId: 'ai-native-builder',
    nameKey: 'channels.aiNativeBuilder.name',
    descriptionKey: 'channels.aiNativeBuilder.description',
    icon: 'heroicons:cpu-chip',
  },
  {
    key: 'drumnext',
    channelId: 'drum',
    nameKey: 'channels.drum.name',
    descriptionKey: 'channels.drum.description',
    icon: 'mdi:music-circle',
  },
  {
    key: 'visual-and-sound',
    channelId: 'visual-and-sound',
    nameKey: 'channels.visualAndSound.name',
    descriptionKey: 'channels.visualAndSound.description',
    icon: 'heroicons:sparkles',
  },
]

const activeTab = ref(tabs[0].key)

const activeChannelData = computed(() => typedYoutubeData.channels[activeTab.value] || null)
const activeChannel = computed(() => tabs.find((tab) => tab.key === activeTab.value) || tabs[0])
const activeChannelProfile = computed(() =>
  youtubeChannels.find((channel) => channel.id === activeChannel.value.channelId),
)
const activeChannelName = computed(() => t(activeChannel.value.nameKey))
const activeChannelDescription = computed(() => t(activeChannel.value.descriptionKey))
const featuredVideo = computed(
  () => activeChannelData.value?.videos[0] || activeChannelData.value?.shorts[0] || null,
)

const channelStats = computed(() => {
  const channel = activeChannelData.value?.channel

  if (!channel) return []

  return [
    {
      key: 'subscribers',
      label: t('drum.subscribers'),
      icon: 'mdi:account-multiple',
      value: formatNumber(channel.subscriberCount),
    },
    {
      key: 'views',
      label: t('drum.totalViews'),
      icon: 'mdi:eye',
      value: formatNumber(channel.viewCount),
    },
    {
      key: 'videos',
      label: t('drum.totalVideos'),
      icon: 'mdi:video',
      value: formatNumber(channel.videoCount),
    },
  ]
})

const formatNumber = (num: number) => num.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return remainingSeconds > 0
    ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    : `${minutes}:00`
}
const getVideoUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`
</script>

<template>
  <main class="videos-page mx-auto max-w-[90rem] px-5 pb-20 pt-9 sm:px-8 sm:pt-12 lg:px-12 xl:px-16">
    <section class="border-b border-[var(--line-subtle)] pb-12 sm:pb-14">
      <div class="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <p class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
            {{ t('videos.eyebrow') }}
          </p>
          <h1 class="mt-4 text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl">
            {{ t('videos.title') }}
          </h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {{ t('videos.description') }}
          </p>
        </div>

        <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {{ tabs.length }} {{ t('videos.channels') }}
        </p>
      </div>
    </section>

    <section class="border-b border-[var(--line-subtle)] py-10 sm:py-12">
      <div class="flex items-end justify-between gap-6">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {{ t('videos.channelLineup') }}
          </p>
          <h2 class="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            {{ t('videos.channels') }}
          </h2>
        </div>
      </div>

      <div class="mt-7 grid gap-3 lg:grid-cols-3">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="flex min-h-[7.5rem] overflow-hidden rounded-lg border transition-colors"
          :class="
            activeTab === tab.key
              ? 'border-foreground bg-card'
              : 'border-[var(--line-card)] bg-card/50 hover:border-[var(--line-control)]'
          "
        >
          <button
            type="button"
            class="group flex min-w-0 flex-1 items-start gap-4 px-5 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
            :aria-pressed="activeTab === tab.key"
            :aria-label="t('videos.selectChannel', { channel: t(tab.nameKey) })"
            @click="activeTab = tab.key"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
              :class="
                activeTab === tab.key
                  ? 'border-red-600/45 bg-red-600/10 text-red-700 dark:border-red-300/40 dark:bg-red-300/10 dark:text-red-300'
                  : 'border-[var(--line-card)] text-muted-foreground'
              "
            >
              <Icon :name="tab.icon" class="h-5 w-5" />
            </span>
            <span class="min-w-0">
              <span class="block text-base font-semibold text-foreground">
                {{ t(tab.nameKey) }}
              </span>
              <span class="mt-2 block text-sm leading-5 text-muted-foreground">
                {{ t(tab.descriptionKey) }}
              </span>
            </span>
          </button>
          <a
            v-if="youtubeChannels.find((channel) => channel.id === tab.channelId)"
            :href="youtubeChannels.find((channel) => channel.id === tab.channelId)?.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="t('videos.openChannel')"
            :aria-label="t('videos.openChannel')"
            class="flex w-12 shrink-0 items-center justify-center border-l border-[var(--line-subtle)] text-muted-foreground outline-none transition-colors hover:bg-red-600/5 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground dark:hover:text-red-300"
          >
            <Icon name="heroicons:arrow-up-right" class="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>

    <template v-if="activeChannelData">
      <section class="grid gap-9 border-b border-[var(--line-subtle)] py-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,1.12fr)] lg:items-end lg:gap-14">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
            {{ t('videos.selectedChannel') }}
          </p>
          <h2 class="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {{ activeChannelName }}
          </h2>
          <p class="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            {{ activeChannelDescription }}
          </p>

          <a
            v-if="activeChannelProfile"
            :href="activeChannelProfile.url"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground outline-none transition-colors hover:text-red-700 focus-visible:ring-2 focus-visible:ring-foreground dark:hover:text-red-300"
          >
            {{ t('videos.openChannel') }}
            <Icon name="heroicons:arrow-up-right" class="h-4 w-4" />
          </a>

          <dl class="mt-9 grid grid-cols-3 border-y border-[var(--line-subtle)]">
            <div
              v-for="(stat, index) in channelStats"
              :key="stat.key"
              class="min-w-0 py-4 sm:py-5"
              :class="index > 0 ? 'border-l border-[var(--line-subtle)] pl-4 sm:pl-6' : 'pr-4 sm:pr-6'"
            >
              <dt class="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon :name="stat.icon" class="h-3.5 w-3.5" />
                <span class="line-clamp-1">{{ stat.label }}</span>
              </dt>
              <dd class="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                {{ stat.value }}
              </dd>
            </div>
          </dl>
        </div>

        <a
          v-if="featuredVideo"
          :href="getVideoUrl(featuredVideo.id)"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative block w-full overflow-hidden rounded-lg border border-[var(--line-card)] bg-card outline-none focus-visible:ring-2 focus-visible:ring-foreground lg:justify-self-end lg:max-w-[36rem]"
        >
          <div class="relative aspect-video overflow-hidden">
            <img
              :src="featuredVideo.thumbnail"
              :alt="featuredVideo.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 sm:p-6">
              <div class="min-w-0">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
                  {{ t('videos.latestRelease') }}
                </p>
                <h3 class="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-white sm:text-xl">
                  {{ featuredVideo.title }}
                </h3>
              </div>
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                <Icon name="heroicons:play-solid" class="ml-0.5 h-4 w-4" />
              </span>
            </div>
          </div>
        </a>
      </section>

      <section v-if="activeChannelData.videos.length > 0" class="border-b border-[var(--line-subtle)] py-12">
        <div class="flex items-end justify-between gap-6">
          <div>
            <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {{ t('videos.latestRelease') }}
            </p>
            <h2 class="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
              {{ t('drum.latestVideos') }}
            </h2>
          </div>
        </div>

        <div class="mt-7 grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          <a
            v-for="video in activeChannelData.videos.slice(0, 6)"
            :key="video.id"
            :href="getVideoUrl(video.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="group block outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <div class="relative aspect-video overflow-hidden rounded-lg border border-[var(--line-card)] bg-card">
              <img
                :src="video.thumbnail"
                :alt="video.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
              />
              <span class="absolute bottom-3 right-3 rounded-sm bg-black/85 px-2 py-1 font-mono text-[10px] text-white">
                {{ formatDuration(video.durationSeconds) }}
              </span>
            </div>
            <div class="pt-4">
              <h3 class="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-red-700 dark:group-hover:text-red-300">
                {{ video.title }}
              </h3>
              <p class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="mdi:eye" class="h-3.5 w-3.5" />
                <span>{{ formatNumber(video.viewCount) }} {{ t('drum.views') }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatDate(video.publishedAt) }}</span>
              </p>
            </div>
          </a>
        </div>
      </section>

      <section v-if="activeChannelData.shorts.length > 0" class="border-b border-[var(--line-subtle)] py-12">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {{ activeChannelName }}
          </p>
          <h2 class="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            {{ t('drum.shorts') }}
          </h2>
        </div>

        <div class="mt-7 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          <a
            v-for="short in activeChannelData.shorts.slice(0, 12)"
            :key="short.id"
            :href="getVideoUrl(short.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="group block outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <div class="relative aspect-[9/16] overflow-hidden rounded-lg border border-[var(--line-card)] bg-card">
              <img
                :src="short.thumbnail"
                :alt="short.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <span class="absolute bottom-3 left-3 right-3 line-clamp-2 text-sm font-semibold leading-snug text-white">
                {{ short.title }}
              </span>
            </div>
            <p class="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="mdi:eye" class="h-3.5 w-3.5" />
              <span>{{ formatNumber(short.viewCount) }}</span>
            </p>
          </a>
        </div>
      </section>

      <div
        v-if="activeChannelData.videos.length === 0 && activeChannelData.shorts.length === 0"
        class="border-b border-[var(--line-subtle)] py-16 text-center"
      >
        <p class="text-muted-foreground">{{ t('drum.noVideos') }}</p>
      </div>
    </template>

    <p
      v-if="typedYoutubeData.metadata.fetchedAt"
      class="pt-6 text-right font-mono text-[10px] text-muted-foreground"
    >
      {{ t('drum.lastUpdated') }} · {{ formatDate(typedYoutubeData.metadata.fetchedAt) }}
    </p>
  </main>
</template>
