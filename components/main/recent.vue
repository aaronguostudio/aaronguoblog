<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { BlogPost } from '~/types/blog'

const { locale } = useI18n()

// Function to parse dates in the format "1st Mar 2023"
function parseCustomDate(dateStr: string): Date {
  // Remove ordinal indicators (st, nd, rd, th)
  const cleanDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1')
  // Parse the date
  return new Date(cleanDateStr)
}

// Get Last Publish Posts from the content/blog directory
const { data, error } = await useAsyncData(`recent-post-${locale}`, () =>
  queryCollection(locale.value as 'en' | 'zh')
    .all()
    .then((data) => {
      return data
        .sort((a, b) => {
          const aDate = parseCustomDate(a.meta.date as string)
          const bDate = parseCustomDate(b.meta.date as string)
          return bDate.getTime() - aDate.getTime()
        })
        .slice(0, 4)
    }),
)

// Handle potential errors during fetch
if (error.value) {
  console.error('Error fetching recent posts:', error.value)
}

const formattedData = computed(() => {
  return data.value?.map((articles) => {
    const meta = articles.meta as unknown as BlogPost

    // Extract the blog slug from the content path
    const contentPath = articles.path
    const blogSlug = contentPath.replace(`/blogs/${locale.value}/`, '')

    // Create the localized URL path
    const localePath = locale.value === 'en' ? `/blogs/${blogSlug}` : `/zh/blogs/${blogSlug}`

    return {
      path: localePath,
      title: articles.title || 'no-title available',
      description: articles.description || 'no-description available',
      image: meta.image || '/not-found.jpg',
      alt: meta.alt || 'no alter data available',
      ogImage: meta.ogImage || '/not-found.jpg',
      date: meta.date || 'not-date-available',
      tags: meta.tags || [],
      published: meta.published || false,
    }
  })
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
  <div class="pb-10 px-4">
    <div class="flex flex-row items-center space-x-3 pt-5 pb-3">
      <h2 class="text-4xl font-semibold text-black dark:text-zinc-300">Recent</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      <template v-if="data?.length === 0">
        <BlogEmpty />
      </template>
    </div>
  </div>
</template>
