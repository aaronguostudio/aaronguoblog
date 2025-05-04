<script lang="ts" setup>
import { makeFirstCharUpper } from '@/utils/helper'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

/**
 * Query blog posts from the collection corresponding to the current locale
 * Using a static key to ensure it's pre-rendered during build
 */
const { data } = await useAsyncData('all-categories-page', () =>
  Promise.all([queryCollection('en').all(), queryCollection('zh').all()]),
)

/**
 * Extract all tags from blog posts for the current locale
 */
const allTags = computed(() => {
  if (!data.value) return new Map()

  // Get the posts for the current locale (index 0 for English, index 1 for Chinese)
  const localeIndex = locale.value === 'en' ? 0 : 1
  const posts = data.value[localeIndex]

  const tagsMap = new Map()

  posts.forEach((blog) => {
    const tags: Array<string> = (blog.meta.tags as string[]) || []
    tags.forEach((tag) => {
      if (tagsMap.has(tag)) {
        const cnt = tagsMap.get(tag)
        tagsMap.set(tag, cnt + 1)
      } else {
        tagsMap.set(tag, 1)
      }
    })
  })

  return tagsMap
})

useHead({
  title: t('categories.title'),
  meta: [
    {
      name: 'description',
      content: t('categories.description'),
    },
  ],
})

// Generate OG Image
const siteData = useSiteConfig()
defineOgImage({
  props: {
    title: t('categories.title'),
    description: t('categories.description'),
    siteName: siteData.url,
  },
})
</script>

<template>
  <main class="container max-w-8xl mx-auto text-zinc-600">
    <CategoryHero />
    <div class="flex flex-wrap px-4 mt-12 gap-3">
      <CategoryCard
        v-for="topic in allTags"
        :key="topic[0]"
        :title="makeFirstCharUpper(topic[0])"
        :count="topic[1]"
      />
    </div>
  </main>
</template>
