<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

useHead({
  title: t('navigation.home'),
  meta: [
    {
      name: 'description',
      content: t('home.welcome'),
    },
  ],
})

// Generate OG Image
defineOgImageComponent('About', {
  headline: 'Greetings 👋',
  title: t('og.homeTitle'),
  description: t('home.welcome'),
})
</script>

<template>
  <main class="container max-w-8xl mx-auto">
    <MainHero />
    <MainAbout />
    <MainRecent />
    <!-- <MainTrending /> -->
  </main>
</template>
