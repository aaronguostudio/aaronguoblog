<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

useHead({
  title: 'AI Native',
  meta: [
    {
      name: 'description',
      content: t('aiNative.description'),
    },
  ],
})

defineOgImageComponent('AINative', {
  headline: 'Embrace AI 🤖',
  title: 'AI Native',
  description: t('aiNative.description'),
})
</script>

<template>
  <div class="py-8">
    <div class="container max-w-4xl mx-auto px-4 space-y-6">
      <h1 class="text-3xl sm:text-5xl font-bold">
        {{ t('aiNative.title') }}
      </h1>
      <p class="text-lg">
        {{ t('aiNative.intro') }}
      </p>

      <div>
        <h2 class="text-2xl font-semibold mb-2">
          {{ t('aiNative.dailyHeading') }}
        </h2>
        <ul class="list-disc ml-5 space-y-1">
          <li>{{ t('aiNative.daily1') }}</li>
          <li>{{ t('aiNative.daily2') }}</li>
          <li>{{ t('aiNative.daily3') }}</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-semibold mb-2">
          {{ t('aiNative.visionHeading') }}
        </h2>
        <p>{{ t('aiNative.vision') }}</p>
      </div>
    </div>
  </div>
</template>

