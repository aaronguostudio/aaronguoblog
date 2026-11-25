<script setup lang="ts">
import { coverImage, signalEditions } from '~/data/signal/editions'
import { useSeo } from '~/utils/seo'

definePageMeta({ key: (route) => route.path })
const route = useRoute()
const { locale } = useI18n()
const edition = signalEditions.find((issue) => issue.date === route.params.date)
if (!edition) throw createError({ statusCode: 404, statusMessage: 'Signal edition not found' })
const language = locale.value === 'zh' ? 'zh' : 'en'
useSeo({
  title: edition.headline[language] + ' · Signal',
  description: edition.intro[language],
  image: coverImage(edition),
  url: route.path,
  locale: language === 'zh' ? 'zh_CN' : 'en_US',
  type: 'article',
  publishedTime: edition.date,
})
</script>

<template>
  <main class="signal-page">
    <SignalReadingDesk :edition="edition" />
    <div class="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16">
      <SignalEditionFinding :edition="edition" />
    </div>
  </main>
</template>
