<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

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
  <main :key="locale" class="container max-w-8xl mx-auto">
    <MainHero />
    <MainRecent />
    <!-- <MainTrending /> -->
  </main>
</template>
