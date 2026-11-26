<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { youtubeChannels } from '~/data/channels'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section aria-labelledby="home-channels-heading" class="my-8 px-4">
    <div class="mb-5 flex items-center gap-3">
      <Icon name="mdi:youtube" class="h-10 w-10 text-red-600" />
      <h2 id="home-channels-heading" class="scroll-mt-24 text-2xl font-bold text-foreground">
        {{ t('channels.title') }}
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        v-for="channel in youtubeChannels"
        :key="channel.id"
        class="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-md"
      >
        <NuxtLink
          :to="
            localePath({
              path: '/videos',
              query: { channel: channel.id },
              hash: '#video-channel-heading',
            })
          "
          :aria-labelledby="`home-channel-${channel.id}`"
          class="group flex flex-1 flex-col p-5 pb-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        >
          <div class="mb-3 flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden"
              :class="[
                channel.logo ? 'rounded-full' : 'rounded-lg',
                channel.logo ? '' : channel.iconBgClass,
              ]"
            >
              <img
                v-if="channel.logo"
                :src="channel.logo"
                alt=""
                class="h-full w-full object-cover"
              />
              <Icon v-else :name="channel.icon" class="h-5 w-5 text-white" />
            </div>
            <h3
              :id="`home-channel-${channel.id}`"
              class="min-w-0 flex-1 text-base font-semibold text-foreground underline-offset-4 group-hover:underline"
            >
              {{ t(channel.nameKey) }}
            </h3>
            <Icon name="heroicons:arrow-right" class="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>

          <p class="line-clamp-2 text-sm text-muted-foreground">
            {{ t(channel.descriptionKey) }}
          </p>
        </NuxtLink>

        <a
          :href="channel.url"
          target="_blank"
          rel="noopener noreferrer"
          class="mx-5 mb-3 inline-flex min-h-10 items-center gap-1.5 self-start text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          data-rybbit-event="channel_click"
          :data-rybbit-prop-channel="channel.id"
          data-rybbit-prop-location="homepage"
        >
          <span class="sr-only">{{ t(channel.nameKey) }} · </span>
          {{ t('channels.watchOnYouTube') }}
          <Icon name="heroicons:arrow-up-right" class="h-3.5 w-3.5" />
          <span class="sr-only">({{ t('navigation.opensInNewTab') }})</span>
        </a>
      </div>
    </div>
  </section>
</template>
