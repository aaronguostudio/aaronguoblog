<script lang="ts" setup>
import { makeFirstCharUpper } from '@/utils/helper'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const { data } = await useAsyncData(`all-blog-post-by-category-${locale.value}`, () =>
  queryCollection(locale.value as 'en' | 'zh').all(),
)

const allTags = new Map()

data.value?.forEach((blog) => {
  const tags: Array<string> = (blog.meta.tags as string[]) || []
  tags.forEach((tag) => {
    if (allTags.has(tag)) {
      const cnt = allTags.get(tag)
      allTags.set(tag, cnt + 1)
    } else {
      allTags.set(tag, 1)
    }
  })
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
    <div class="flex flex-wrap px-6 mt-12 gap-3">
      <CategoryCard
        v-for="topic in allTags"
        :key="topic[0]"
        :title="makeFirstCharUpper(topic[0])"
        :count="topic[1]"
      />
    </div>
  </main>
</template>
