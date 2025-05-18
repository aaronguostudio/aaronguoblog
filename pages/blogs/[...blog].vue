<script setup lang="ts">
import type { BlogPost } from '@/types/blog'
import { navbarData, seoData } from '~/data'

const route = useRoute()
const { locale } = useI18n()

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
    image: meta?.image || defaultImage,
    alt: meta?.alt || 'no alter data available',
    // Use defaultImage if ogImage is not provided or doesn't exist
    ogImage: (articles?.value?.ogImage as unknown as string) || meta?.image || defaultImage,
    date: meta?.date || 'not-date-available',
    tags: meta?.tags || [],
    published: meta?.published || false,
  }
})

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
      content: `${seoData.mySite}/${route.path}`,
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
      content: data.value.ogImage || data.value.image,
    },
    // Test on: https://cards-dev.twitter.com/validator or https://socialsharepreview.com/
    { name: 'twitter:site', content: '@qdnvubp' },
    { name: 'twitter:card', content: 'summary_large_image' },
    {
      name: 'twitter:url',
      content: `${seoData.mySite}/${route.path}`,
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
      content: data.value.ogImage || data.value.image,
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: `${seoData.mySite}/${route.path}`,
    },
  ],
})

console.log(articles.value)

// Generate OG Image
defineOgImageComponent('Test', {
  headline: 'Aaron Guo Blog 👋',
  title: data.value.title || '',
  description: data.value.description || '',
  // Use a default image if ogImage is not available
  link: data.value.ogImage || '/blogs-img/blog.jpg',
})
</script>

<template>
  <div class="p-6 container max-w-8xl mx-auto sm:grid grid-cols-12 gap-x-12">
    <div class="col-span-12 lg:col-span-9">
      <BlogHeader
        :title="data.title"
        :image="data.image"
        :alt="data.alt"
        :date="data.date"
        :description="data.description"
        :tags="data.tags"
      />
      <div
        class="prose prose-pre:max-w-xs sm:prose-pre:max-w-full prose-sm sm:prose-base md:prose-lg max-w-8xl mx-auto prose-zinc dark:prose-invert prose-img:rounded"
      >
        <ContentRenderer v-if="articles" :value="articles">
          <template #empty>
            <p>No content found.</p>
          </template>
        </ContentRenderer>
      </div>
    </div>
    <BlogToc />

    <!-- <div class="flex flex-row flex-wrap md:flex-nowrap mt-10 gap-2">
      <SocialShare
        v-for="network in ['facebook', 'twitter', 'linkedin', 'email']"
        :key="network"
        :network="network"
        :styled="true"
        :label="true"
        class="p-1"
        aria-label="Share with {network}"
      />
    </div> -->
  </div>
</template>
