<script lang="ts" setup>
import Fuse from 'fuse.js'
import { sortByDate } from '~/utils/date'
import { extractBlogPostMeta } from '~/utils/type-guards'
import { useSeo } from '~/utils/seo'

const { t, locale } = useI18n()
const route = useRoute()

/**
 * Pagination and search state
 */
const elementPerPage = ref(24) // Display 24 posts per page for a 4×6 grid
const pageNumber = ref(1)
const searchQuery = ref('')

/**
 * Category filter state
 */
const selectedCategories = ref<string[]>([])

/**
 * Topic filter state
 */
const selectedTopics = ref<string[]>([])

/**
 * Reset to the first page whenever the search query changes
 */
watch(searchQuery, () => {
  pageNumber.value = 1
})

/**
 * Reset to the first page whenever the selected categories change
 */
watch(
  selectedCategories,
  () => {
    pageNumber.value = 1
  },
  { deep: true },
)

/**
 * Reset to the first page whenever the selected topics change
 */
watch(
  selectedTopics,
  () => {
    pageNumber.value = 1
  },
  { deep: true },
)

// Initialize selected categories from URL query parameters
onMounted(() => {
  const categoriesParam = route.query.categories as string
  if (categoriesParam) {
    selectedCategories.value = categoriesParam.split(',')
  }
})

/**
 * Query blog posts from the collection corresponding to the current locale
 * Using a static key to ensure it's pre-rendered during build
 */
const { data } = await useAsyncData('all-blog-posts-page', () =>
  Promise.all([queryCollection('en').all(), queryCollection('zh').all()]),
)

/**
 * Extract all tags from blog posts
 */
const allTags = computed(() => {
  const tagsMap = new Map()

  formattedData.value.forEach((post) => {
    const tags = post.tags || []
    tags.forEach((tag) => {
      if (tagsMap.has(tag)) {
        const count = tagsMap.get(tag)
        tagsMap.set(tag, count + 1)
      } else {
        tagsMap.set(tag, 1)
      }
    })
  })

  return tagsMap
})

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
      topics: meta.topics,
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
 * Filter data based on search query, selected categories, and selected topics
 */
const searchData = computed(() => {
  let filteredData = formattedData.value

  // First filter by search query
  if (searchQuery.value.trim()) {
    const results = fuse.value.search(searchQuery.value)
    filteredData = results.map((result) => result.item)
  }

  // Then filter by selected categories
  if (selectedCategories.value.length > 0) {
    filteredData = filteredData.filter((post) => {
      // Check if post has at least one of the selected categories
      return selectedCategories.value.some((category) => post.tags && post.tags.includes(category))
    })
  }

  // Then filter by selected topics
  if (selectedTopics.value.length > 0) {
    filteredData = filteredData.filter((post) => {
      // Check if post has at least one of the selected topics
      return selectedTopics.value.some((topic) => post.topics && post.topics.includes(topic))
    })
  }

  return filteredData
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
  <main class="container max-w-8xl mx-auto py-8">
    <!-- Page Header with Gradient -->
    <div class="px-4 mb-12">
      <div class="relative">
        <!-- Decorative gradient background -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-3xl" />

        <div class="relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
          <h1 class="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
            Writing
          </h1>
          <p class="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Thoughts on AI, execution, leadership, and building products
          </p>
        </div>
      </div>
    </div>

    <div class="px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Category filter sidebar -->
      <div class="lg:col-span-1">
        <div class="sticky top-24">
          <BlogCategoryFilter
            :all-tags="allTags"
            :selected-categories="selectedCategories"
            @update:selected-categories="selectedCategories = $event"
          />
        </div>
      </div>

      <!-- Blog posts section -->
      <div class="lg:col-span-3">
        <!-- Topic Filter -->
        <BlogTopicFilter
          :selected-topics="selectedTopics"
          @update:selected-topics="selectedTopics = $event"
        />

        <!-- Search bar with enhanced design -->
        <div class="pb-8">
          <div class="relative w-full mx-auto group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search blogs by title, description, or tags..."
              class="block w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm hover:shadow-md"
              :aria-label="t('blogs.searchPlaceholder')"
            />
          </div>
        </div>
        <!-- Blog posts grid -->
        <div v-auto-animate class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
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
            <h2 class="text-xl font-semibold mb-2">No posts found</h2>
            <p class="text-muted-foreground max-w-md">
              {{
                searchQuery || selectedCategories.length > 0
                  ? 'Try different search terms, categories, or browse all posts.'
                  : 'No blog posts are available yet.'
              }}
            </p>
            <div class="flex gap-4 mt-4">
              <button
                v-if="searchQuery"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                @click="searchQuery = ''"
              >
                Clear search
              </button>
              <button
                v-if="selectedCategories.length > 0"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                @click="selectedCategories = []"
              >
                Clear categories
              </button>
            </div>
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
      </div>
    </div>
  </main>
</template>
