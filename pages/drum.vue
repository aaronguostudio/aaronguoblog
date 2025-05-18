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
  <div class="py-8">
    <div class="container max-w-4xl mx-auto px-4 space-y-6">
      <h1 class="text-3xl sm:text-5xl font-bold">{{ t('drum.title') }}</h1>
      <p>{{ t('drum.description') }}</p>
    </div>
  </div>
</template>
