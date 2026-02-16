<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { socialLinks } from '~/data'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="container mx-auto py-12 sm:py-16">
    <div class="px-4 max-w-4xl mx-auto">
      <div class="relative">
        <!-- Decorative gradient background -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-3xl -z-10"
        />

        <div class="flex flex-col gap-6">
          <!-- Avatar + Name -->
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg"
            >
              AG
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Aaron Guo
              </h2>
              <p class="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
                Product Builder · Engineer · AI Practitioner
              </p>
            </div>
          </div>

          <!-- Headline -->
          <h1
            class="font-bold leading-tight text-3xl md:text-5xl bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent"
          >
            {{ t('home.title') }}
          </h1>

          <!-- Subheadline -->
          <p class="text-zinc-700 dark:text-zinc-300 text-lg md:text-xl leading-relaxed max-w-3xl">
            {{ t('home.description') }}
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 mt-4">
            <NuxtLink
              to="/subscribe"
              class="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 overflow-hidden"
            >
              <span class="relative z-10 flex items-center gap-2">
                <Icon name="heroicons:envelope" class="w-5 h-5" />
                Subscribe
              </span>
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-105"
            >
              <span class="flex items-center gap-2">
                {{ t('navigation.about') }}
                <Icon
                  name="heroicons:arrow-right"
                  class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                />
              </span>
            </NuxtLink>
          </div>

          <!-- Social links row -->
          <div class="flex items-center gap-4 mt-2">
            <a
              :href="socialLinks.githubLink"
              target="_blank"
              rel="noopener noreferrer"
              class="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              aria-label="GitHub"
            >
              <Icon name="mdi:github" class="w-5 h-5" />
            </a>
            <a
              :href="socialLinks.linkedinLink"
              target="_blank"
              rel="noopener noreferrer"
              class="text-zinc-400 hover:text-blue-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Icon name="mdi:linkedin" class="w-5 h-5" />
            </a>
            <a
              :href="socialLinks.twitterLink"
              target="_blank"
              rel="noopener noreferrer"
              class="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              aria-label="Twitter/X"
            >
              <Icon name="mdi:twitter" class="w-5 h-5" />
            </a>
            <a
              :href="socialLinks.youtubeLink"
              target="_blank"
              rel="noopener noreferrer"
              class="text-zinc-400 hover:text-red-600 transition-colors"
              aria-label="YouTube"
            >
              <Icon name="mdi:youtube" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
