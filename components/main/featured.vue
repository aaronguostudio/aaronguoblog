<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { sortByDate } from '~/utils/date'
import { extractBlogPostMeta } from '~/utils/type-guards'

const { locale, t } = useI18n()

/**
 * Query blog posts from the collection corresponding to the current locale
 * Using a static key to ensure it's pre-rendered during build
 */
const { data } = await useAsyncData('featured-blog-posts', () =>
  Promise.all([queryCollection('en').all(), queryCollection('zh').all()]),
)

/**
 * Format and process featured blog post data for the current locale
 */
const formattedData = computed(() => {
  if (!data.value) return []

  // Get the posts for the current locale (index 0 for English, index 1 for Chinese)
  const localeIndex = locale.value === 'en' ? 0 : 1
  const posts = data.value[localeIndex]

  // Map content data to BlogPost objects
  const formattedPosts = posts.map((article) => {
    // Extract metadata using our utility function
    const meta = extractBlogPostMeta(article)

    // Extract the blog slug from the content path
    const contentPath = article.path
    const blogSlug = contentPath.replace(`/blogs/${locale.value}/`, '')

    // Create the localized URL path
    const localePath = locale.value === 'en' ? `/blogs/${blogSlug}` : `/zh/blogs/${blogSlug}`

    return {
      path: localePath,
      title: article.title || meta.title,
      description: article.description || meta.description,
      image: meta.image,
      alt: meta.alt,
      ogImage: meta.ogImage,
      date: meta.date,
      tags: meta.tags,
      published: meta.published,
      featured: meta.featured || false,
    }
  })

  // Filter for featured posts only
  const featuredPosts = formattedPosts.filter((post) => post.featured)

  // Filter out unpublished posts in production
  const publishedPosts =
    process.env.NODE_ENV === 'production'
      ? featuredPosts.filter((post) => post.published)
      : featuredPosts

  // Sort by date (newest first) and take only the first 4
  return sortByDate(publishedPosts, 'date').slice(0, 4)
})
</script>

<template>
  <div class="pb-10 px-4">
    <!-- Section Header with Accent Bar -->
    <div class="flex items-center gap-3 pt-5 pb-6">
      <div class="w-1 h-10 bg-foreground rounded-full" />
      <h2 class="text-4xl font-bold text-foreground">
        {{ t('home.featured') }}
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <template v-for="post in formattedData" :key="post.title">
        <BlogCard
          :path="post.path"
          :title="post.title"
          :date="post.date"
          :description="post.description"
          :image="post.image"
          :alt="post.alt"
          :og-image="post.ogImage"
          :tags="post.tags"
          :published="post.published"
        />
      </template>
      <template v-if="formattedData.length === 0">
        <BlogEmpty />
      </template>
    </div>
  </div>
</template>
