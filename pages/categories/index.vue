<script lang="ts" setup>
import {
  createCategoryCounts,
  getBlogCategoryLabel,
} from '~/utils/blog-taxonomy'
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
 * Extract reader-facing categories from blog posts for the current locale
 */
const allCategories = computed(() => {
  if (!data.value) return new Map()

  // Get the posts for the current locale (index 0 for English, index 1 for Chinese)
  const localeIndex = locale.value === 'en' ? 0 : 1
  const posts = data.value[localeIndex]

  return createCategoryCounts(posts.map((blog) => ({
    category: blog.meta.category,
    categories: blog.meta.categories,
  })))
})

const categoryCards = computed(() =>
  [...allCategories.value.entries()].map(([id, count]) => ({
    id,
    title: getBlogCategoryLabel(id, locale.value),
    count,
  })),
)

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
        v-for="category in categoryCards"
        :id="category.id"
        :key="category.id"
        :title="category.title"
        :count="category.count"
      />
    </div>
  </main>
</template>
