<script setup lang="ts">
import { useI18n } from 'vue-i18n'

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
  headline: 'Drum \ud83e\udd41',
  title: 'Drum',
  description: t('drum.description'),
})
</script>

<template>
  <main class="container max-w-4xl mx-auto px-4 py-12">
    <!-- Page Header with Gradient -->
    <div class="mb-12">
      <div class="relative">
        <!-- Decorative gradient background -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-3xl" />

        <div class="relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-5xl">🥁</span>
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
              {{ t('drum.title') }}
            </h1>
          </div>
          <p class="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {{ t('drum.description') }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
