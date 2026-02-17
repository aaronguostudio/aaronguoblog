<script setup>
import { useI18n } from 'vue-i18n'
import { siteMetaData } from './data'

const { locale } = useI18n()

useHead({
  htmlAttrs: {
    lang: () => (locale.value === 'zh' ? 'zh-CN' : 'en'),
  },
  meta: () => siteMetaData,
  link: [
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'Aaron Guo - RSS Feed',
      href: '/rss.xml',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage :key="locale" />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

html.dark {
  color-scheme: dark;
}
</style>
