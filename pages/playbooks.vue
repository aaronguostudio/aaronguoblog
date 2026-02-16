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
    process.env.NODE_ENV === 'production' ? playbooks.filter((post) => post.published) : playbooks

  return sortByDate(publishedPlaybooks, 'date')
})
</script>

<template>
  <main class="container max-w-6xl mx-auto px-4 py-12">
    <!-- Page Header with Gradient -->
    <div class="mb-12">
      <div class="relative">
        <!-- Decorative gradient background -->
        <div
          class="absolute inset-0 bg-foreground/[0.02] dark:bg-foreground/[0.03] rounded-3xl blur-3xl"
        />

        <div
          class="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl"
        >
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {{ t('playbooks.title') }}
          </h1>
          <p class="text-xl text-muted-foreground leading-relaxed max-w-3xl">
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
        class="group p-6 border border-border rounded-lg hover:border-foreground/20 hover:shadow-lg transition-all"
      >
        <h2
          class="text-2xl font-semibold mb-3 text-foreground group-hover:text-foreground/70 transition-colors"
        >
          {{ playbook.title }}
        </h2>
        <p class="text-muted-foreground mb-4 line-clamp-3">
          {{ playbook.description }}
        </p>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{{ playbook.date }}</span>
          <span v-if="playbook.topics && playbook.topics.length > 0">•</span>
          <div v-if="playbook.topics" class="flex gap-2">
            <span
              v-for="topic in playbook.topics.slice(0, 2)"
              :key="topic"
              class="px-2 py-1 bg-secondary rounded text-xs"
            >
              {{ topic }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <h2 class="text-2xl font-semibold mb-4 text-foreground">
        {{ t('playbooks.comingSoon') }}
      </h2>
      <p class="text-muted-foreground max-w-md mb-6">
        {{ t('playbooks.comingSoonDescription') }}
      </p>
      <NuxtLink
        to="/blogs"
        class="px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground rounded-lg transition-colors"
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
