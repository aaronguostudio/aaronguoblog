<script setup lang="ts">
import type { BlogPost } from '@/types/blog'
import { navbarData, seoData } from '~/data'
import { getBlogCategories } from '~/utils/blog-taxonomy'

// Define a custom page name to avoid route name conflicts
definePageMeta({
  name: 'blogs-single',
})

const route = useRoute()
const { locale } = useI18n()

// Track scroll depth milestones (25%, 50%, 75%, 100%)
const { useScrollDepthTracking } = useRybbitAnalytics()
useScrollDepthTracking(route.path)

// Determine the correct collection and content path
const collection = computed(() => locale.value)

// Transform the URL path to the content path
const contentPath = computed(() => {
  // Extract the blog slug from the URL path
  let blogSlug = route.path

  // Remove language prefix if present
  if (route.path.startsWith('/zh/blogs/')) {
    blogSlug = route.path.replace('/zh/blogs/', '')
  } else if (route.path.startsWith('/blogs/')) {
    blogSlug = route.path.replace('/blogs/', '')
  }

  // Construct the content path based on the collection and slug
  return `/blogs/${collection.value}/${blogSlug}`
})

console.log('Content path:', contentPath.value)

const { data: articles, error } = await useAsyncData(
  `blog-post-${route.path}`,
  () =>
    queryCollection(collection.value as 'en' | 'zh')
      .path(contentPath.value)
      .first(),
  {
    watch: [() => route.path],
  },
)

if (error.value) navigateTo('/404')

const data = computed<BlogPost>(() => {
  const meta = articles?.value?.meta as unknown as BlogPost
  const defaultImage = '/blogs-img/blog.jpg'
  return {
    title: articles.value?.title || 'no-title available',
    description: articles.value?.description || 'no-description available',
    image: meta?.image || '', // Empty string instead of default - allows conditional display
    alt: meta?.alt || 'no alter data available',
    // Use defaultImage for ogImage only (for social sharing)
    ogImage: (articles?.value?.ogImage as unknown as string) || meta?.image || defaultImage,
    date: meta?.date || 'not-date-available',
    categories: getBlogCategories(meta || {}),
    tags: meta?.tags || [],
    published: meta?.published || false,
    youtube: meta?.youtube,
    audio: meta?.audio,
  }
})

const canonicalUrl = computed(() => new URL(route.path, seoData.mySite).toString())
const socialImageUrl = computed(() =>
  new URL(data.value.ogImage || data.value.image || '/blogs-img/blog.jpg', seoData.mySite).toString(),
)

useHead({
  title: data.value.title || '',
  meta: [
    { name: 'description', content: data.value.description },
    {
      name: 'description',
      content: data.value.description,
    },
    // Test on: https://developers.facebook.com/tools/debug/ or https://socialsharepreview.com/
    { property: 'og:site_name', content: navbarData.homeTitle },
    { property: 'og:type', content: 'website' },
    {
      property: 'og:url',
      content: canonicalUrl.value,
    },
    {
      property: 'og:title',
      content: data.value.title,
    },
    {
      property: 'og:description',
      content: data.value.description,
    },
    {
      property: 'og:image',
      content: socialImageUrl.value,
    },
    // Test on: https://cards-dev.twitter.com/validator or https://socialsharepreview.com/
    { name: 'twitter:site', content: '@aaronguostudio' },
    { name: 'twitter:card', content: 'summary_large_image' },
    {
      name: 'twitter:url',
      content: canonicalUrl.value,
    },
    {
      name: 'twitter:title',
      content: data.value.title,
    },
    {
      name: 'twitter:description',
      content: data.value.description,
    },
    {
      name: 'twitter:image',
      content: socialImageUrl.value,
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
})

console.log(articles.value)
</script>

<template>
  <div class="px-4 pb-16 container max-w-8xl mx-auto sm:grid grid-cols-12 gap-x-12">
    <div class="col-span-12 lg:col-span-9">
      <BlogHeader
        :title="data.title"
        :image="data.image"
        :alt="data.alt"
        :date="data.date"
        :description="data.description"
        :categories="data.categories || []"
        :tags="data.tags"
      />
      <div class="lg:hidden mb-6">
        <BlogMediaLinks :youtube="data.youtube" :audio="data.audio" />
      </div>
      <div
        class="prose prose-pre:max-w-xs sm:prose-pre:max-w-full prose-sm sm:prose-base md:prose-lg prose-h1:hidden max-w-8xl mx-auto prose-zinc dark:prose-invert prose-img:rounded-lg"
      >
        <ContentRenderer v-if="articles" :value="articles">
          <template #empty>
            <p>No content found.</p>
          </template>
        </ContentRenderer>
      </div>
    </div>
    <div class="lg:col-span-3 hidden lg:block sticky top-24 self-start">
      <BlogToc />
      <BlogMediaLinks :youtube="data.youtube" :audio="data.audio" />
    </div>
  </div>
</template>
