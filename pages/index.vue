<script lang="ts" setup>
import { navbarData } from '~/data'
import { siteDescription } from '~/app/content'
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
  description: t('welcome'),
  link: '/riyad.jpg',
})
</script>

<template>
  <main class="container max-w-5xl mx-auto text-zinc-600">
    <MainHero />
    <MainRecent />
    <MainTrending />
  </main>
</template>
