<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { sortByDate } from '~/utils/date'
import { extractBlogPostMeta } from '~/utils/type-guards'

const { t, locale } = useI18n()

useHead({
  title: t('playbooks.title'),
  meta: [
    {
      name: 'description',
      content: t('playbooks.description'),
    },
  ],
})

// Generate OG Image
defineOgImageComponent('About', {
  headline: 'Playbooks 📚',
  title: t('playbooks.title'),
  description: t('playbooks.description'),
})

/**
 * Query blog posts and filter for playbooks
 */
const { data } = await useAsyncData('playbooks', () =>
  Promise.all([queryCollection('en').all(), queryCollection('zh').all()]),
)

/**
 * Format and filter playbook data
 */
const playbooksData = computed(() => {
  if (!data.value) return []

  const localeIndex = locale.value === 'en' ? 0 : 1
  const posts = data.value[localeIndex]

  const formattedPosts = posts.map((article) => {
    const meta = extractBlogPostMeta(article)
    const contentPath = article.path
    const blogSlug = contentPath.replace(`/blogs/${locale.value}/`, '')
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
      featured: meta.featured,
    }
  })

  // Filter for featured posts (these are our playbooks for now)
  const playbooks = formattedPosts.filter((post) => post.featured)

  // Filter out unpublished in production
  const publishedPlaybooks =
    process.env.NODE_ENV === 'production'
      ? playbooks.filter((post) => post.published)
      : playbooks

  return sortByDate(publishedPlaybooks, 'date')
})
</script>

<template>
  <main class="container max-w-6xl mx-auto px-4 py-12">
    <!-- Page Header with Gradient -->
    <div class="mb-12">
      <div class="relative">
        <!-- Decorative gradient background -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-3xl" />

        <div class="relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
            {{ t('playbooks.title') }}
          </h1>
          <p class="text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-3xl">
            {{ t('playbooks.description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Playbooks Grid -->
    <div v-if="playbooksData.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <NuxtLink
        v-for="playbook in playbooksData"
        :key="playbook.path"
        :to="playbook.path"
        class="group p-6 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
      >
        <h2 class="text-2xl font-semibold mb-3 text-black dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ playbook.title }}
        </h2>
        <p class="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
          {{ playbook.description }}
        </p>
        <div class="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
          <span>{{ playbook.date }}</span>
          <span v-if="playbook.topics && playbook.topics.length > 0">•</span>
          <div v-if="playbook.topics" class="flex gap-2">
            <span
              v-for="topic in playbook.topics.slice(0, 2)"
              :key="topic"
              class="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs"
            >
              {{ topic }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <h2 class="text-2xl font-semibold mb-4 text-black dark:text-zinc-100">
        {{ t('playbooks.comingSoon') }}
      </h2>
      <p class="text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
        {{ t('playbooks.comingSoonDescription') }}
      </p>
      <NuxtLink
        to="/blogs"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        {{ t('playbooks.browseWriting') }}
      </NuxtLink>
    </div>

    <!-- Newsletter CTA -->
    <div class="mt-16">
      <NewsletterSignup
        variant="inline"
        :title="t('playbooks.newsletterTitle')"
        :description="t('playbooks.newsletterDescription')"
      />
    </div>
  </main>
</template>

