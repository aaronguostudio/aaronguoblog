<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { seoData } from '~/data'

const { t } = useI18n()
const socialImageUrl = new URL('/social/aaron-guo-midnight-v1.jpg', seoData.mySite).href
const socialImageAlt =
  'Aaron Guo — I build with AI and share what works. A blue glass sphere and lavender triangle on a dark background.'

const { data: staticSnapshot } = await useStaticRadarSnapshot('home-radar-latest')

useHead({
  title: t('navigation.home'),
  meta: [
    {
      name: 'description',
      content: t('home.welcome'),
    },
    { property: 'og:image', content: socialImageUrl },
    { property: 'og:image:type', content: 'image/jpeg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: socialImageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: socialImageUrl },
    { name: 'twitter:image:alt', content: socialImageAlt },
  ],
})
</script>

<template>
  <main class="container max-w-8xl mx-auto flex flex-col gap-5 sm:gap-6">
    <section class="px-4">
      <div
        class="grid overflow-hidden border-y border-[color:var(--line-subtle)] lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]"
      >
        <MainHero />
        <MainNotes />
      </div>
    </section>
    <MainWriting :signal-snapshot="staticSnapshot">
      <MainChannels />
    </MainWriting>
  </main>
</template>
