<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

useHead({
  title: t('start.title'),
  meta: [
    {
      name: 'description',
      content: t('start.description'),
    },
  ],
})

// Generate OG Image
defineOgImageComponent('About', {
  headline: 'Start Here 👋',
  title: t('start.title'),
  description: t('start.description'),
})
</script>

<template>
  <main class="container max-w-4xl mx-auto px-4 py-12">
    <!-- Page Header with Gradient -->
    <div class="mb-12">
      <div class="relative">
        <!-- Decorative gradient background -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-3xl" />

        <div class="relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
            {{ t('start.title') }}
          </h1>
          <p class="text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {{ t('start.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- About Me Section -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        <h2 class="text-2xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
          {{ t('start.aboutTitle') }}
        </h2>
      </div>
      <div class="prose dark:prose-invert max-w-none">
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
          {{ t('start.bio1') }}
        </p>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {{ t('start.bio2') }}
        </p>
      </div>
    </div>

    <!-- Credibility Markers -->
    <div class="mb-12 relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-lg">
      <!-- Decorative corner accent -->
      <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full rounded-tr-2xl" />

      <div class="relative">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
          <h2 class="text-2xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
            {{ t('start.credibilityTitle') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <h3 class="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Icon name="heroicons:briefcase" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {{ t('start.roleTitle') }}
            </h3>
            <ul class="space-y-2 text-zinc-700 dark:text-zinc-300">
              <li class="flex items-start gap-2">
                <span class="text-blue-500 mt-1">•</span>
                <span>Head of Products at Mawer Investment Management</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-1">•</span>
                <span>Partner</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-pink-500 mt-1">•</span>
                <span>Software Engineer</span>
              </li>
            </ul>
          </div>
          <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
            <h3 class="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Icon name="heroicons:rocket-launch" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {{ t('start.systemsTitle') }}
            </h3>
            <ul class="space-y-2 text-zinc-700 dark:text-zinc-300">
              <li class="flex items-start gap-2">
                <span class="text-blue-500 mt-1">•</span>
                <span>MAP (execution alignment platform)</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-500 mt-1">•</span>
                <span>Internal reporting workflows</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-pink-500 mt-1">•</span>
                <span>AI-native execution systems</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- What I'm Working On Now -->
    <div class="mb-12 relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        <h2 class="text-2xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
          {{ t('start.nowTitle') }}
        </h2>
      </div>
      <div class="prose dark:prose-invert max-w-none">
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
          {{ t('start.now1') }}
        </p>
        <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {{ t('start.now2') }}
        </p>
      </div>
    </div>

    <!-- Connect Section -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        <h2 class="text-2xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
          {{ t('start.connectTitle') }}
        </h2>
      </div>
      <div class="flex flex-wrap gap-4">
        <a
          href="https://www.linkedin.com/in/aaronguostudio/"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
        >
          <Icon name="mdi:linkedin" class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          LinkedIn
        </a>
        <a
          href="https://github.com/aaronguostudio"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl transition-all duration-300 shadow-lg shadow-zinc-500/30 hover:shadow-xl hover:scale-105"
        >
          <Icon name="mdi:github" class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          GitHub
        </a>
        <a
          href="https://www.youtube.com/@aaronguostudio"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-105"
        >
          <Icon name="mdi:youtube" class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          YouTube
        </a>
      </div>
    </div>

    <!-- Three Paths -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-1 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        <h2 class="text-3xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
          {{ t('start.pathsTitle') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Path 1: Product Leadership -->
        <div class="group relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full rounded-tr-2xl" />
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:user-group" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              {{ t('start.path1Title') }}
            </h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">
              {{ t('start.path1Description') }}
            </p>
            <NuxtLink
              to="/blogs?tag=Leadership"
              class="group/link inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {{ t('start.explorePath') }}
              <Icon name="heroicons:arrow-right" class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
            </NuxtLink>
          </div>
        </div>

        <!-- Path 2: Execution Systems -->
        <div class="group relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full rounded-tr-2xl" />
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              {{ t('start.path2Title') }}
            </h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">
              {{ t('start.path2Description') }}
            </p>
            <NuxtLink
              to="/blogs?tag=Product"
              class="group/link inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
            >
              {{ t('start.explorePath') }}
              <Icon name="heroicons:arrow-right" class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
            </NuxtLink>
          </div>
        </div>

        <!-- Path 3: AI-Native Workflows -->
        <div class="group relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-pink-500 dark:hover:border-pink-500 transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-500/10 to-blue-500/10 rounded-bl-full rounded-tr-2xl" />
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:sparkles" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              {{ t('start.path3Title') }}
            </h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">
              {{ t('start.path3Description') }}
            </p>
            <NuxtLink
              to="/blogs?topic=ai-native"
              class="group/link inline-flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors"
            >
              {{ t('start.explorePath') }}
              <Icon name="heroicons:arrow-right" class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommended Reads -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-1 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        <h2 class="text-3xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
          {{ t('start.recommendedTitle') }}
        </h2>
      </div>

      <div class="space-y-4">
        <NuxtLink
          to="/blogs/9.a-new-chapter"
          class="group block p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            A New Chapter
          </h3>
          <p class="text-zinc-600 dark:text-zinc-400">
            How to redesign life with AI—finding balance among family, health, career, and personal growth
          </p>
        </NuxtLink>

        <NuxtLink
          to="/blogs/10.openai-serp-api-web-search-ai-summary"
          class="group block p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Building a Web Search + AI Summary Tool
          </h3>
          <p class="text-zinc-600 dark:text-zinc-400">
            How to combine OpenAI and SERP API to create a powerful web search and AI summary tool
          </p>
        </NuxtLink>

        <NuxtLink
          to="/blogs/8.learn-graph-db-neo4j"
          class="block p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <h3 class="text-lg font-semibold text-black dark:text-zinc-100 mb-2">
            Learn Graph DB - Neo4j
          </h3>
          <p class="text-zinc-600 dark:text-zinc-400">
            Exploring Graph RAG and how to use Graph DB to solve real problems
          </p>
        </NuxtLink>
      </div>
    </div>

    <!-- Newsletter Signup -->
    <NewsletterSignup variant="inline" />
  </main>
</template>

