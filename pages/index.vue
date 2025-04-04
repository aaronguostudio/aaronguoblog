<script lang="ts" setup>
import { navbarData } from '~/data'
import { siteDescription } from '~/app/content'

useHead({
  title: 'Home',
  meta: [
    {
      name: 'description',
      content: siteDescription,
    },
  ],
})

// Generate OG Image
defineOgImageComponent('About', {
  headline: 'Greetings 👋',
  title: navbarData.homeTitle,
  description: siteDescription,
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
