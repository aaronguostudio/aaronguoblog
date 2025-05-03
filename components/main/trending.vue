<script lang="ts" setup>
import type { BlogPost } from '~/types/blog'

const { locale } = useI18n()

const { data } = await useAsyncData(`trending-post-${locale.value}`, () =>
  queryCollection(locale.value as 'en' | 'zh')
    .limit(3)
    .all(),
)

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
      <template v-if="data?.length === 0">
        <BlogEmpty />
      </template>
    </div>
  </div>
</template>
