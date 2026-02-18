<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { sortByDate, formatDate } from '~/utils/date'
import { extractBlogPostMeta } from '~/utils/type-guards'

const { locale, t } = useI18n()
const localePath = useLocalePath()

/**
 * Query all blog posts from both locale collections
 */
const { data } = await useAsyncData('homepage-writing-posts', () =>
  Promise.all([queryCollection('en').all(), queryCollection('zh').all()]),
)

/**
 * Format and process all blog posts for the current locale, sorted by date
 */
const allPosts = computed(() => {
  if (!data.value) return []

  const localeIndex = locale.value === 'en' ? 0 : 1
  const posts = data.value[localeIndex]

  const formattedPosts = posts.map((article) => {
    const meta = extractBlogPostMeta(article)
    const contentPath = article.path
    const blogSlug = contentPath.replace(`/blogs/${locale.value}/`, '')
    const path = locale.value === 'en' ? `/blogs/${blogSlug}` : `/zh/blogs/${blogSlug}`

    return {
      path,
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

  const publishedPosts =
    process.env.NODE_ENV === 'production'
      ? formattedPosts.filter((post) => post.published)
      : formattedPosts

  return sortByDate(publishedPosts, 'date')
})

/** Hero post — the latest post */
const heroPost = computed(() => allPosts.value[0] || null)

/** Compact sidebar posts — posts 2-4 */
const sidebarPosts = computed(() => allPosts.value.slice(1, 4))

/** Grid posts — posts 5+ */
const gridPosts = computed(() => allPosts.value.slice(4, 8))

/**
 * Format date for compact display
 */
function compactDate(dateStr: string) {
  return formatDate(dateStr, locale.value === 'zh' ? 'zh-CN' : 'en-US')
}
</script>

<template>
  <div class="pb-10 px-4">
    <!-- Hero + Compact Sidebar -->
    <div v-if="heroPost" class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
      <!-- Hero Card (left, 3 cols) -->
      <NuxtLink :to="localePath(heroPost.path)" class="lg:col-span-3 group block">
        <article
          class="relative h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20"
        >
          <img
            :src="heroPost.image || '/blogs-img/blog.jpg'"
            :alt="heroPost.alt"
            class="w-full h-72 lg:h-[500px] object-cover object-center group-hover:scale-[1.02] transition-all duration-500"
          />
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <span
                v-for="tag in heroPost.tags.slice(0, 2)"
                :key="tag"
                class="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs font-medium"
              >
                {{ tag }}
              </span>
            </div>
            <h3
              class="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300"
            >
              {{ heroPost.title }}
            </h3>
            <p class="text-muted-foreground line-clamp-2 mb-3">
              {{ heroPost.description }}
            </p>
            <div class="flex items-center text-sm text-muted-foreground">
              <LogoDate class="mr-1.5 h-4 w-4" />
              {{ compactDate(heroPost.date) }}
            </div>
          </div>
        </article>
      </NuxtLink>

      <!-- Compact Sidebar (right, 2 cols) -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <NuxtLink
          v-for="post in sidebarPosts"
          :key="post.title"
          :to="localePath(post.path)"
          class="group flex-1"
        >
          <article
            class="h-full flex flex-row overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20"
          >
            <div class="w-72 shrink-0 overflow-hidden p-4 rounded-md">
              <img
                :src="post.image || '/blogs-img/blog.jpg'"
                :alt="post.alt"
                class="w-full h-full rounded-md object-cover object-center group-hover:scale-[1.02] transition-all duration-500"
              />
            </div>
            <div class="flex flex-col justify-center p-4 flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span
                  v-for="tag in post.tags.slice(0, 1)"
                  :key="tag"
                  class="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs font-medium"
                >
                  {{ tag }}
                </span>
                <span class="text-xs text-muted-foreground">{{ compactDate(post.date) }}</span>
              </div>
              <h4
                class="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1"
              >
                {{ post.title }}
              </h4>
              <p class="text-sm text-muted-foreground line-clamp-2">
                {{ post.description }}
              </p>
            </div>
          </article>
        </NuxtLink>
      </div>
    </div>

    <!-- Dense Grid for remaining posts -->
    <div
      v-if="gridPosts.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <NuxtLink
        v-for="post in gridPosts"
        :key="post.title"
        :to="localePath(post.path)"
        class="group block"
      >
        <article
          class="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20"
        >
          <img
            :src="post.image || '/blogs-img/blog.jpg'"
            :alt="post.alt"
            class="w-full h-60 object-cover object-center group-hover:scale-[1.02] transition-all duration-500"
          />
          <div class="p-4">
            <h4
              class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1"
            >
              {{ post.title }}
            </h4>
            <div class="flex items-center text-xs text-muted-foreground">
              <LogoDate class="mr-1 h-3.5 w-3.5" />
              {{ compactDate(post.date) }}
            </div>
          </div>
        </article>
      </NuxtLink>
    </div>

    <!-- View all writing link -->
    <div class="flex justify-center">
      <NuxtLink
        :to="localePath('/blogs')"
        class="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors duration-300"
      >
        {{ t('home.viewAllWriting') }}
        <Icon
          name="heroicons:arrow-right"
          class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
        />
      </NuxtLink>
    </div>

    <!-- Empty state -->
    <template v-if="allPosts.length === 0">
      <BlogEmpty />
    </template>
  </div>
</template>
