<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
          <!-- Headline with gradient text -->
          <h1
            class="font-bold leading-tight text-4xl md:text-6xl bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent"
          >
            {{ t('home.title') }}
          </h1>

          <!-- Subheadline -->
          <p class="text-zinc-700 dark:text-zinc-300 text-lg md:text-xl leading-relaxed max-w-3xl">
            {{ t('home.description') }}
          </p>

          <!-- CTAs with enhanced design -->
          <div class="flex flex-col sm:flex-row gap-4 mt-4">
            <a
              href="#newsletter"
              class="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 overflow-hidden"
            >
              <span class="relative z-10 flex items-center gap-2">
                <Icon name="heroicons:envelope" class="w-5 h-5" />
                Subscribe to Newsletter
              </span>
            </a>
            <NuxtLink
              to="/start"
              class="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-105"
            >
              <span class="flex items-center gap-2">
                Start Here
                <Icon
                  name="heroicons:arrow-right"
                  class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                />
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
