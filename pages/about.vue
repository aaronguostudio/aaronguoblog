<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { socialLinks } from '~/data'

const { t } = useI18n()

useHead({
  title: t('about.title'),
  meta: [
    {
      name: 'description',
      content: t('about.description'),
    },
  ],
})

defineOgImageComponent('About', {
  headline: 'About 👋',
  title: t('about.title'),
  description: t('about.description'),
})
</script>

<template>
  <main class="container max-w-4xl mx-auto px-4 py-12">
    <!-- Page Header -->
    <div class="mb-12">
      <div class="relative">
        <div
          class="absolute inset-0 bg-foreground/[0.02] dark:bg-foreground/[0.03] rounded-3xl blur-3xl"
        />
        <div
          class="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl"
        >
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {{ t('about.title') }}
          </h1>
          <p class="text-xl text-muted-foreground leading-relaxed">
            {{ t('about.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- My Story -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-foreground rounded-full" />
        <h2 class="text-2xl font-bold text-foreground">
          {{ t('about.bioTitle') }}
        </h2>
      </div>
      <div class="prose dark:prose-invert max-w-none">
        <p class="text-muted-foreground leading-relaxed mb-4">
          {{ t('about.bio1') }}
        </p>
        <p class="text-muted-foreground leading-relaxed">
          {{ t('about.bio2') }}
        </p>
      </div>
    </div>

    <!-- What I Do -->
    <div class="mb-12 relative bg-card border-2 border-border rounded-2xl p-8 shadow-lg">
      <div
        class="absolute top-0 right-0 w-24 h-24 bg-foreground/5 rounded-bl-full rounded-tr-2xl"
      />
      <div class="relative">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1 h-8 bg-foreground rounded-full" />
          <h2 class="text-2xl font-bold text-foreground">
            {{ t('about.credibilityTitle') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-secondary rounded-xl border border-border">
            <h3 class="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <Icon name="heroicons:briefcase" class="w-5 h-5 text-foreground" />
              {{ t('about.roleTitle') }}
            </h3>
            <ul class="space-y-2 text-muted-foreground">
              <li class="flex items-start gap-2">
                <span class="text-foreground mt-1">•</span>
                <span>Product Leader at a Financial Firm</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-foreground mt-1">•</span>
                <span>Software Engineer</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-foreground mt-1">•</span>
                <span>AI Practitioner</span>
              </li>
            </ul>
          </div>
          <div class="p-4 bg-secondary rounded-xl border border-border">
            <h3 class="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <Icon name="heroicons:rocket-launch" class="w-5 h-5 text-foreground" />
              {{ t('about.systemsTitle') }}
            </h3>
            <ul class="space-y-2 text-muted-foreground">
              <li class="flex items-start gap-2">
                <span class="text-foreground mt-1">•</span>
                <span>AI-native execution systems</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-foreground mt-1">•</span>
                <span>Internal reporting workflows</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-foreground mt-1">•</span>
                <span>Product delivery platforms</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- What I'm Working On -->
    <div class="mb-12 relative bg-secondary border-2 border-border rounded-2xl p-8 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-foreground rounded-full" />
        <h2 class="text-2xl font-bold text-foreground">
          {{ t('about.nowTitle') }}
        </h2>
      </div>
      <div class="prose dark:prose-invert max-w-none">
        <p class="text-muted-foreground leading-relaxed mb-4">
          {{ t('about.now1') }}
        </p>
        <p class="text-muted-foreground leading-relaxed">
          {{ t('about.now2') }}
        </p>
      </div>
    </div>

    <!-- Connect -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-foreground rounded-full" />
        <h2 class="text-2xl font-bold text-foreground">
          {{ t('about.connectTitle') }}
        </h2>
      </div>
      <div class="flex flex-wrap gap-4">
        <a
          :href="socialLinks.linkedinLink"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Icon
            name="mdi:linkedin"
            class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
          />
          LinkedIn
        </a>
        <a
          :href="socialLinks.githubLink"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Icon
            name="mdi:github"
            class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
          />
          GitHub
        </a>
        <a
          :href="socialLinks.twitterLink"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Icon
            name="mdi:twitter"
            class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
          />
          Twitter/X
        </a>
        <a
          :href="socialLinks.youtubeLink"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Icon
            name="mdi:youtube"
            class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
          />
          YouTube
        </a>
      </div>
    </div>

    <!-- What I Write About -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-1 h-10 bg-foreground rounded-full" />
        <h2 class="text-3xl font-bold text-foreground">
          {{ t('start.pathsTitle') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Product Execution -->
        <div
          class="group relative bg-card border-2 border-border rounded-2xl p-6 hover:border-foreground/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-16 h-16 bg-foreground/5 rounded-bl-full rounded-tr-2xl"
          />
          <div class="relative">
            <div
              class="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <Icon name="heroicons:user-group" class="w-6 h-6 text-background" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-foreground">
              {{ t('start.path1Title') }}
            </h3>
            <p class="text-muted-foreground mb-4">{{ t('start.path1Description') }}</p>
            <NuxtLink
              to="/blogs?topic=execution"
              class="group/link inline-flex items-center gap-2 text-foreground hover:text-foreground/70 font-medium transition-colors"
            >
              {{ t('start.explorePath') }}
              <Icon
                name="heroicons:arrow-right"
                class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- AI-Native Systems -->
        <div
          class="group relative bg-card border-2 border-border rounded-2xl p-6 hover:border-foreground/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-16 h-16 bg-foreground/5 rounded-bl-full rounded-tr-2xl"
          />
          <div class="relative">
            <div
              class="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-background" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-foreground">
              {{ t('start.path2Title') }}
            </h3>
            <p class="text-muted-foreground mb-4">{{ t('start.path2Description') }}</p>
            <NuxtLink
              to="/blogs?topic=ai-native"
              class="group/link inline-flex items-center gap-2 text-foreground hover:text-foreground/70 font-medium transition-colors"
            >
              {{ t('start.explorePath') }}
              <Icon
                name="heroicons:arrow-right"
                class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- Building in Public -->
        <div
          class="group relative bg-card border-2 border-border rounded-2xl p-6 hover:border-foreground/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-16 h-16 bg-foreground/5 rounded-bl-full rounded-tr-2xl"
          />
          <div class="relative">
            <div
              class="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <Icon name="heroicons:sparkles" class="w-6 h-6 text-background" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-foreground">
              {{ t('start.path3Title') }}
            </h3>
            <p class="text-muted-foreground mb-4">{{ t('start.path3Description') }}</p>
            <NuxtLink
              to="/blogs?topic=building-in-public"
              class="group/link inline-flex items-center gap-2 text-foreground hover:text-foreground/70 font-medium transition-colors"
            >
              {{ t('start.explorePath') }}
              <Icon
                name="heroicons:arrow-right"
                class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommended Reads -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-1 h-10 bg-foreground rounded-full" />
        <h2 class="text-3xl font-bold text-foreground">
          {{ t('start.recommendedTitle') }}
        </h2>
      </div>
      <div class="space-y-4">
        <NuxtLink
          to="/blogs/9.a-new-chapter"
          class="group block p-6 bg-card border-2 border-border rounded-2xl hover:border-foreground/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <h3
            class="text-lg font-semibold text-foreground mb-2 group-hover:text-foreground/70 transition-colors"
          >
            A New Chapter
          </h3>
          <p class="text-muted-foreground">
            How to redesign life with AI—finding balance among family, health, career, and personal
            growth
          </p>
        </NuxtLink>
        <NuxtLink
          to="/blogs/10.openai-serp-api-web-search-ai-summary"
          class="group block p-6 bg-card border-2 border-border rounded-2xl hover:border-foreground/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <h3
            class="text-lg font-semibold text-foreground mb-2 group-hover:text-foreground/70 transition-colors"
          >
            Building a Web Search + AI Summary Tool
          </h3>
          <p class="text-muted-foreground">
            How to combine OpenAI and SERP API to create a powerful web search and AI summary tool
          </p>
        </NuxtLink>
        <NuxtLink
          to="/blogs/15.why-i-stopped-writing-and-built-ai-studio"
          class="group block p-6 bg-card border-2 border-border rounded-2xl hover:border-foreground/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <h3
            class="text-lg font-semibold text-foreground mb-2 group-hover:text-foreground/70 transition-colors"
          >
            Why I Stopped Writing and Built AI Studio
          </h3>
          <p class="text-muted-foreground">
            The story behind stepping away from content and building something real
          </p>
        </NuxtLink>
      </div>
    </div>

    <!-- Newsletter CTA -->
    <NewsletterSignup variant="inline" />
  </main>
</template>
