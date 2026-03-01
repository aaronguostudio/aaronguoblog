<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { youtubeChannels } from '~/data/channels'

const { t } = useI18n()

</script>

<template>
  <div class="my-8 px-4">
    <div class="flex items-center gap-3 mb-5">
      <Icon name="mdi:youtube" class="w-10 h-10 text-red-600" />
      <h2 class="text-2xl font-bold text-foreground">
        {{ t('channels.title') }}
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
        data-rybbit-event="channel_click"
        :data-rybbit-prop-channel="channel.id"
        data-rybbit-prop-location="homepage"
      >
        <div
          class="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-primary/20 h-full flex flex-col"
        >
          <!-- Channel avatar + name row -->
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

          <!-- YouTube icon — top right, show on hover -->
          <Icon
            name="mdi:youtube"
            class="absolute top-3 right-3 w-5 h-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />

          <!-- Description -->
          <p class="text-sm text-muted-foreground line-clamp-2 flex-1">
            {{ t(channel.descriptionKey) }}
          </p>
        </div>
      </a>
    </div>
  </div>
</template>
