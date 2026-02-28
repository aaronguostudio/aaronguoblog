<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { socialLinks } from '~/data'

const { locale, t } = useI18n()

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
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {{ t('about.title') }}
      </h1>
      <p class="text-xl text-muted-foreground leading-relaxed">
        {{ t('about.subtitle') }}
      </p>
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
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-8 bg-foreground rounded-full" />
        <h2 class="text-2xl font-bold text-foreground">
          {{ t('about.credibilityTitle') }}
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-5 rounded-xl border border-border">
          <h3 class="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
            <Icon name="heroicons:briefcase" class="w-5 h-5 text-muted-foreground" />
            {{ t('about.roleTitle') }}
          </h3>
          <ul class="space-y-2 text-muted-foreground">
            <li class="flex items-start gap-2">
              <span class="text-foreground mt-1">•</span>
              <span>{{ t('about.roleItem1') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-foreground mt-1">•</span>
              <span>{{ t('about.roleItem2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-foreground mt-1">•</span>
              <span>{{ t('about.roleItem3') }}</span>
            </li>
          </ul>
        </div>
        <div class="p-5 rounded-xl border border-border">
          <h3 class="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
            <Icon name="heroicons:rocket-launch" class="w-5 h-5 text-muted-foreground" />
            {{ t('about.systemsTitle') }}
          </h3>
          <ul class="space-y-2 text-muted-foreground">
            <li class="flex items-start gap-2">
              <span class="text-foreground mt-1">•</span>
              <span>{{ t('about.systemsItem1') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-foreground mt-1">•</span>
              <span>{{ t('about.systemsItem2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-foreground mt-1">•</span>
              <span>{{ t('about.systemsItem3') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- What I'm Working On -->
    <div class="mb-12">
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
      <div class="flex flex-wrap gap-3">
        <a
          :href="socialLinks.linkedinLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-foreground rounded-lg transition-colors duration-200"
          data-rybbit-event="outbound_click"
          data-rybbit-prop-platform="linkedin"
          data-rybbit-prop-location="about"
        >
          <Icon name="mdi:linkedin" class="w-5 h-5" />
          LinkedIn
        </a>
        <a
          :href="socialLinks.githubLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-foreground rounded-lg transition-colors duration-200"
          data-rybbit-event="outbound_click"
          data-rybbit-prop-platform="github"
          data-rybbit-prop-location="about"
        >
          <Icon name="mdi:github" class="w-5 h-5" />
          GitHub
        </a>
        <a
          :href="socialLinks.twitterLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-foreground rounded-lg transition-colors duration-200"
          data-rybbit-event="outbound_click"
          data-rybbit-prop-platform="twitter"
          data-rybbit-prop-location="about"
        >
          <Icon name="mdi:twitter" class="w-5 h-5" />
          Twitter/X
        </a>
        <a
          :href="socialLinks.youtubeLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-foreground rounded-lg transition-colors duration-200"
          data-rybbit-event="outbound_click"
          data-rybbit-prop-platform="youtube"
          data-rybbit-prop-location="about"
        >
          <Icon name="mdi:youtube" class="w-5 h-5" />
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
          class="group border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors duration-200"
        >
          <div class="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center mb-4">
            <Icon name="heroicons:user-group" class="w-5 h-5 text-background" />
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
              class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200"
            />
          </NuxtLink>
        </div>

        <!-- AI-Native Systems -->
        <div
          class="group border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors duration-200"
        >
          <div class="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center mb-4">
            <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-background" />
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
              class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200"
            />
          </NuxtLink>
        </div>

        <!-- Building in Public -->
        <div
          class="group border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors duration-200"
        >
          <div class="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center mb-4">
            <Icon name="heroicons:sparkles" class="w-5 h-5 text-background" />
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
              class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
