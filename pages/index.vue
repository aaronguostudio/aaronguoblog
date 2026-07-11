<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { data: staticSnapshot } = await useStaticRadarSnapshot('home-radar-latest')

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
