<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { youtubeChannels } from '~/data/channels'
import youtubeData from '~/data/youtube.json'

const { t } = useI18n()

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

// Tab definitions mapped to youtube.json channel keys
const tabs = [
  { key: 'ai-native-builder', label: 'AI Native Builder', icon: 'heroicons:cpu-chip' },
  { key: 'drumnext', label: 'Aaron - Drum', icon: 'mdi:music-circle' },
  { key: 'visual-and-sound', label: 'Visual And Sound', icon: 'heroicons:sparkles' },
]

const activeTab = ref(tabs[0].key)

const activeChannelData = computed(() => {
  return (youtubeData as any).channels[activeTab.value] || null
})

const formatNumber = (num: number) => num.toLocaleString('en-US')
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
  <main class="container max-w-8xl mx-auto px-4 py-12">
    <!-- Hero -->
    <div class="mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {{ t('videos.title') }}
      </h1>
      <p class="text-lg text-muted-foreground">
        {{ t('videos.description') }}
      </p>
    </div>

    <!-- YouTube Channels -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-foreground rounded-full" />
        <h2 class="text-2xl font-bold text-foreground">
          {{ t('videos.channels') }}
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          v-for="channel in youtubeChannels"
          :key="channel.id"
          :href="channel.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group block cursor-pointer"
        >
          <div
            class="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-primary/20 h-full flex flex-col"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden"
                :class="[channel.logo ? 'rounded-full' : 'rounded-lg', channel.logo ? '' : channel.iconBgClass]"
              >
                <img
                  v-if="channel.logo"
                  :src="channel.logo"
                  :alt="t(channel.nameKey)"
                  class="w-full h-full object-cover"
                >
                <Icon v-else :name="channel.icon" class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {{ t(channel.nameKey) }}
                </h3>
              </div>
            </div>
            <Icon
              name="mdi:youtube"
              class="absolute top-3 right-3 w-5 h-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
            <p class="text-sm text-muted-foreground line-clamp-2 flex-1">
              {{ t(channel.descriptionKey) }}
            </p>
          </div>
        </a>
      </div>
    </div>

    <!-- Channel Tabs -->
    <div class="mb-8">
      <div class="flex items-center gap-2 border-b border-border">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px cursor-pointer"
          :class="activeTab === tab.key
            ? 'border-foreground text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'"
          @click="activeTab = tab.key"
        >
          <Icon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Active Channel Content -->
    <template v-if="activeChannelData">
      <!-- Channel Stats -->
      <div v-if="activeChannelData.channel.subscriberCount > 0" class="mb-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-border bg-card p-5">
            <div class="flex items-center gap-3 mb-2">
              <Icon name="mdi:account-multiple" class="w-5 h-5 text-muted-foreground" />
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('drum.subscribers') }}</h3>
            </div>
            <p class="text-3xl font-bold text-foreground">
              {{ formatNumber(activeChannelData.channel.subscriberCount) }}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-card p-5">
            <div class="flex items-center gap-3 mb-2">
              <Icon name="mdi:eye" class="w-5 h-5 text-muted-foreground" />
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('drum.totalViews') }}</h3>
            </div>
            <p class="text-3xl font-bold text-foreground">
              {{ formatNumber(activeChannelData.channel.viewCount) }}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-card p-5">
            <div class="flex items-center gap-3 mb-2">
              <Icon name="mdi:video" class="w-5 h-5 text-muted-foreground" />
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('drum.totalVideos') }}</h3>
            </div>
            <p class="text-3xl font-bold text-foreground">
              {{ formatNumber(activeChannelData.channel.videoCount) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Latest Videos -->
      <div v-if="activeChannelData.videos.length > 0" class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1 h-8 bg-foreground rounded-full" />
          <h2 class="text-2xl font-bold text-foreground">
            {{ t('drum.latestVideos') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            v-for="video in activeChannelData.videos.slice(0, 6)"
            :key="video.id"
            :href="getVideoUrl(video.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="group block cursor-pointer"
          >
            <div
              class="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <div class="relative aspect-video overflow-hidden">
                <img
                  :src="video.thumbnail"
                  :alt="video.title"
                  class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div
                  class="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded"
                >
                  {{ formatDuration(video.durationSeconds) }}
                </div>
              </div>
              <div class="p-4">
                <h3
                  class="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300"
                >
                  {{ video.title }}
                </h3>
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="mdi:eye" class="w-4 h-4" />
                  <span>{{ formatNumber(video.viewCount) }} {{ t('drum.views') }}</span>
                  <span class="mx-1">&middot;</span>
                  <span>{{ formatDate(video.publishedAt) }}</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Shorts -->
      <div v-if="activeChannelData.shorts.length > 0" class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1 h-8 bg-foreground rounded-full" />
          <h2 class="text-2xl font-bold text-foreground">
            {{ t('drum.shorts') }}
          </h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <a
            v-for="short in activeChannelData.shorts.slice(0, 12)"
            :key="short.id"
            :href="getVideoUrl(short.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="group block cursor-pointer"
          >
            <div
              class="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <div class="relative aspect-[9/16] overflow-hidden">
                <img
                  :src="short.thumbnail"
                  :alt="short.title"
                  class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div class="absolute bottom-2 left-2 right-2">
                  <h3 class="text-white text-sm font-semibold line-clamp-2">
                    {{ short.title }}
                  </h3>
                  <div class="flex items-center gap-1 text-xs text-white/80 mt-1">
                    <Icon name="mdi:eye" class="w-3 h-3" />
                    <span>{{ formatNumber(short.viewCount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Empty state when no videos and no shorts -->
      <div
        v-if="activeChannelData.videos.length === 0 && activeChannelData.shorts.length === 0"
        class="text-center py-12"
      >
        <p class="text-muted-foreground">{{ t('drum.noVideos') }}</p>
      </div>
    </template>

    <!-- Last Updated -->
    <div v-if="youtubeData.metadata.fetchedAt" class="text-center text-sm text-muted-foreground mt-8">
      {{ t('drum.lastUpdated') }}: {{ formatDate((youtubeData as any).metadata.fetchedAt) }}
    </div>
  </main>
</template>
