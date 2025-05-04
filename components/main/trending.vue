<script lang="ts" setup>
import { sortByDate } from '~/utils/date'
import { extractBlogPostMeta } from '~/utils/type-guards'

const { locale } = useI18n()

/**
 * Query blog posts from the collection corresponding to the current locale
 * Using a static key to ensure it's pre-rendered during build
 */
const { data } = await useAsyncData('all-trending-posts', () =>
  Promise.all([queryCollection('en').limit(3).all(), queryCollection('zh').limit(3).all()]),
)

/**
 * Format and process blog post data for the current locale
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
    }
  })

  // Filter out unpublished posts in production
  const publishedPosts =
    process.env.NODE_ENV === 'production'
      ? formattedPosts.filter((post) => post.published)
      : formattedPosts

  // Sort by date (newest first)
  return sortByDate(publishedPosts, 'date')
})

useHead({
  title: 'Home',
  meta: [
    {
      name: 'description',
      content:
        'Welcome To My Blog Site. Get Web Development, Javascript, Typescript, NodeJs, Vue, and Nuxt, Related Articles, Tips, Learning resources and more.',
    },
  ],
})
</script>

<template>
  <div class="px-4">
    <div class="flex flex-row items-center space-x-3 pt-5 pb-3">
      <h2 class="text-4xl font-semibold text-black dark:text-zinc-300">Trending</h2>
    </div>
    <div class="grid grid-cols-1 gap-8">
      <template v-for="post in formattedData" :key="post.title">
        <ArchiveCard
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
