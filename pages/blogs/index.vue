<script lang="ts" setup>
import Fuse from 'fuse.js'
import { sortByDate } from '~/utils/date'
import { extractBlogPostMeta } from '~/utils/type-guards'
import { useSeo } from '~/utils/seo'

const { t, locale } = useI18n()

/**
 * Pagination and search state
 */
const elementPerPage = ref(6) // Increased from 5 to 6 for better grid layout
const pageNumber = ref(1)
const searchQuery = ref('')

/**
 * Query blog posts from the collection corresponding to the current locale
 */
const { data } = await useAsyncData(`all-blog-post-${locale.value}`, () =>
  queryCollection(locale.value as 'en' | 'zh').all(),
)

/**
 * Format and process blog post data
 */
const formattedData = computed(() => {
  if (!data.value) return []

  // Map content data to BlogPost objects
  const posts = data.value.map((article) => {
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
    process.env.NODE_ENV === 'production' ? posts.filter((post) => post.published) : posts

  // Sort by date (newest first)
  return sortByDate(publishedPosts, 'date')
})

/**
 * Setup search functionality with Fuse.js
 */
const fuse = computed(() => {
  return new Fuse(formattedData.value, {
    keys: ['title', 'description', 'tags'],
    threshold: 0.4,
    includeScore: false,
  })
})

/**
 * Filter data based on search query
 */
const searchData = computed(() => {
  if (!searchQuery.value.trim()) {
    return formattedData.value
  }

  const results = fuse.value.search(searchQuery.value)
  return results.map((result) => result.item)
})

/**
 * Paginate the data
 */
const paginatedData = computed(() => {
  const startIndex = (pageNumber.value - 1) * elementPerPage.value
  const endIndex = pageNumber.value * elementPerPage.value

  return searchData.value.slice(startIndex, endIndex)
})

/**
 * Calculate total pages
 */
const totalPages = computed(() => {
  const totalContent = searchData.value.length || 0
  return Math.ceil(totalContent / elementPerPage.value)
})

/**
 * Pagination controls
 */
function onPreviousPage() {
  if (pageNumber.value > 1) pageNumber.value -= 1
}

function onNextPage() {
  if (pageNumber.value < totalPages.value) pageNumber.value += 1
}

/**
 * SEO configuration
 */
useSeo({
  title: t('blogs.title'),
  description: t('blogs.description'),
  url: '/blogs',
})

// Generate OG Image
defineOgImage({
  props: {
    title: t('blogs.title'),
    description: t('blogs.description'),
    siteName: 'Aaron Guo',
  },
})
</script>

<template>
  <main class="container max-w-8xl mx-auto">
    <ArchiveHero />

    <!-- Search bar -->
    <div class="px-4 py-6">
      <div class="relative max-w-2xl mx-auto">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search blogs by title, description, or tags..."
          class="block w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
          :aria-label="t('blogs.searchPlaceholder')"
        />
      </div>
    </div>

    <!-- Blog posts grid -->
    <div v-auto-animate class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-6">
      <template v-for="post in paginatedData" :key="post.title">
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

      <!-- Empty state -->
      <div
        v-if="paginatedData.length === 0"
        class="col-span-full flex flex-col items-center justify-center py-12 text-center"
      >
        <Icon name="heroicons:document-search" class="w-16 h-16 text-muted-foreground mb-4" />
        <h2 class="text-xl font-semibold mb-2">No posts found</h2>
        <p class="text-muted-foreground max-w-md">
          {{
            searchQuery
              ? 'Try a different search term or browse all posts.'
              : 'No blog posts are available yet.'
          }}
        </p>
        <button
          v-if="searchQuery"
          class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          @click="searchQuery = ''"
        >
          Clear search
        </button>
      </div>
    </div>

    <!-- Pagination controls -->
    <div class="flex justify-center items-center space-x-6 py-8">
      <button
        :disabled="pageNumber <= 1"
        class="p-2 rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
        @click="onPreviousPage"
      >
        <Icon name="heroicons:chevron-left" size="24" class="text-foreground" />
      </button>
      <div class="text-foreground font-medium">{{ pageNumber }} / {{ totalPages || 1 }}</div>
      <button
        :disabled="pageNumber >= totalPages"
        class="p-2 rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
        @click="onNextPage"
      >
        <Icon name="heroicons:chevron-right" size="24" class="text-foreground" />
      </button>
    </div>
  </main>
</template>
