<script lang="ts" setup>
import type { BlogPost } from '@/types/blog'
import {
  getBlogCategories,
  getBlogCategoryLabel,
  normalizeBlogCategoryId,
} from '~/utils/blog-taxonomy'
const route = useRoute()
const { locale } = useI18n()

// Take category from route params and normalize to the canonical id.
const categoryId = computed(() => {
  const name = route.params.category || ''
  let strName = ''

  if (Array.isArray(name)) strName = name.at(0) || ''
  else strName = name

  return normalizeBlogCategoryId(strName)
})

const categoryTitle = computed(() =>
  categoryId.value ? getBlogCategoryLabel(categoryId.value, locale.value) : '',
)

/**
 * Query blog posts from the collection corresponding to the current locale
 * Using a static key to ensure it's pre-rendered during build
 */
const { data } = await useAsyncData('all-category-posts', () =>
  Promise.all([queryCollection('en').all(), queryCollection('zh').all()]),
)

/**
 * Filter and format blog posts for the current locale and category
 */
const formattedData = computed(() => {
  if (!data.value) return []

  // Get the posts for the current locale (index 0 for English, index 1 for Chinese)
  const localeIndex = locale.value === 'en' ? 0 : 1
  const posts = data.value[localeIndex]

  // Filter posts by category
  const filteredPosts = posts.filter((article) => {
    const meta = article.meta as unknown as BlogPost
    if (!categoryId.value) return false
    return getBlogCategories(meta).includes(categoryId.value)
  })

  // Map content data to BlogPost objects
  return filteredPosts.map((article) => {
    const meta = article.meta as unknown as BlogPost

    // Extract the blog slug from the content path
    const contentPath = article.path
    const blogSlug = contentPath.replace(`/blogs/${locale.value}/`, '')

    // Create the localized URL path
    const localePath = locale.value === 'en' ? `/blogs/${blogSlug}` : `/zh/blogs/${blogSlug}`

    return {
      path: localePath,
      title: article.title || 'no-title available',
      description: article.description || 'no-description available',
      image: meta.image || '/blogs-img/blog.jpg',
      alt: meta.alt || 'no alter data available',
      ogImage: meta.ogImage || '/blogs-img/blog.jpg',
      date: meta.date || 'not-date-available',
      categories: getBlogCategories(meta),
      tags: meta.tags || [],
      published: meta.published || false,
    }
  })
})

useHead({
  title: categoryTitle.value,
  meta: [
    {
      name: 'description',
      content: `You will find all the ${categoryTitle.value} related post here`,
    },
  ],
})

// Generate OG Image
const siteData = useSiteConfig()
defineOgImage({
  props: {
    title: categoryTitle.value?.toUpperCase(),
    description: `You will find all the ${categoryTitle.value} related post here`,
    siteName: siteData.url,
  },
})
</script>

<template>
  <main class="container max-w-8xl mx-auto text-zinc-600 px-4">
    <CategoryTopic />
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <BlogCard
        v-for="post in formattedData"
        :key="post.title"
        :path="post.path"
        :title="post.title"
        :date="post.date"
        :description="post.description"
        :image="post.image"
        :alt="post.alt"
        :og-image="post.ogImage"
        :categories="post.categories"
        :tags="post.tags"
        :published="post.published"
      />
      <BlogEmpty v-if="formattedData.length === 0" />
    </div>
  </main>
</template>
