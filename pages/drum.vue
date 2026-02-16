<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import youtubeData from '~/data/youtube.json'

const { t } = useI18n()

useHead({
  title: 'Drum',
  meta: [
    {
      name: 'description',
      content: t('drum.description'),
    },
  ],
})

defineOgImageComponent('Drum', {
  headline: 'Drum',
  title: 'Drum',
  description: t('drum.description'),
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
    <!-- Page Header -->
    <div class="mb-12">
      <div class="relative">
        <div
          class="absolute inset-0 bg-foreground/[0.02] dark:bg-foreground/[0.03] rounded-3xl blur-3xl"
        />
        <div
          class="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl"
        >
          <div class="flex items-center gap-4 mb-4">
            <span class="text-5xl">🥁</span>
            <h1 class="text-4xl md:text-5xl font-bold text-foreground">
              {{ t('drum.title') }}
            </h1>
          </div>
          <p class="text-lg text-muted-foreground leading-relaxed">
            {{ t('drum.description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- About Drum Next -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-10 bg-foreground rounded-full" />
        <h2 class="text-3xl font-bold text-foreground">
          {{ t('drum.aboutDrumNext') }}
        </h2>
      </div>
      <div class="relative group">
        <div
          class="absolute inset-0 bg-foreground/[0.05] rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"
        />
        <div
          class="relative bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <p class="text-lg text-muted-foreground leading-relaxed mb-6">
            {{ t('drum.drumNextDescription') }}
          </p>
          <div class="flex flex-wrap gap-4">
            <a
              href="https://www.youtube.com/@drumnext"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Icon
                name="mdi:youtube"
                class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
              />
              {{ t('drum.watchOnYouTube') }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Channel Stats -->
    <div v-if="youtubeData.channel.subscriberCount > 0" class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-10 bg-foreground rounded-full" />
        <h2 class="text-3xl font-bold text-foreground">
          {{ t('drum.channelStats') }}
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="relative group">
          <div
            class="absolute inset-0 bg-foreground/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"
          />
          <div
            class="relative bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div class="flex items-center gap-3 mb-2">
              <Icon name="mdi:account-multiple" class="w-6 h-6 text-foreground" />
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('drum.subscribers') }}</h3>
            </div>
            <p class="text-3xl font-bold text-foreground">
              {{ formatNumber(youtubeData.channel.subscriberCount) }}
            </p>
          </div>
        </div>
        <div class="relative group">
          <div
            class="absolute inset-0 bg-foreground/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"
          />
          <div
            class="relative bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div class="flex items-center gap-3 mb-2">
              <Icon name="mdi:eye" class="w-6 h-6 text-foreground" />
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('drum.totalViews') }}</h3>
            </div>
            <p class="text-3xl font-bold text-foreground">
              {{ formatNumber(youtubeData.channel.viewCount) }}
            </p>
          </div>
        </div>
        <div class="relative group">
          <div
            class="absolute inset-0 bg-foreground/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"
          />
          <div
            class="relative bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div class="flex items-center gap-3 mb-2">
              <Icon name="mdi:video" class="w-6 h-6 text-foreground" />
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('drum.totalVideos') }}</h3>
            </div>
            <p class="text-3xl font-bold text-foreground">
              {{ formatNumber(youtubeData.channel.videoCount) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Latest Videos -->
    <div v-if="youtubeData.videos.length > 0" class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-10 bg-foreground rounded-full" />
        <h2 class="text-3xl font-bold text-foreground">
          {{ t('drum.latestVideos') }}
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="video in youtubeData.videos.slice(0, 6)"
          :key="video.id"
          :href="getVideoUrl(video.id)"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative block"
        >
          <div
            class="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div class="relative aspect-video overflow-hidden">
              <img
                :src="video.thumbnail"
                :alt="video.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div
                class="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded"
              >
                {{ formatDuration(video.durationSeconds) }}
              </div>
            </div>
            <div class="p-4">
              <h3
                class="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-foreground/70 transition-colors"
              >
                {{ video.title }}
              </h3>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="mdi:eye" class="w-4 h-4" />
                <span>{{ formatNumber(video.viewCount) }} {{ t('drum.views') }}</span>
                <span class="mx-1">•</span>
                <span>{{ formatDate(video.publishedAt) }}</span>
              </div>
            </div>
          </div>
        </a>
      </div>
      <div v-if="youtubeData.videos.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">{{ t('drum.noVideos') }}</p>
      </div>
    </div>

    <!-- Shorts -->
    <div v-if="youtubeData.shorts.length > 0" class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-10 bg-foreground rounded-full" />
        <h2 class="text-3xl font-bold text-foreground">
          {{ t('drum.shorts') }}
        </h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <a
          v-for="short in youtubeData.shorts.slice(0, 12)"
          :key="short.id"
          :href="getVideoUrl(short.id)"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative block"
        >
          <div
            class="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div class="relative aspect-[9/16] overflow-hidden">
              <img
                :src="short.thumbnail"
                :alt="short.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
      <div v-if="youtubeData.shorts.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">{{ t('drum.noShorts') }}</p>
      </div>
    </div>

    <!-- Last Updated -->
    <div v-if="youtubeData.metadata.fetchedAt" class="text-center text-sm text-muted-foreground">
      {{ t('drum.lastUpdated') }}: {{ formatDate(youtubeData.metadata.fetchedAt) }}
    </div>
  </main>
</template>
