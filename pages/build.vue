<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { projects } from '~/data/projects'

const { t } = useI18n()

useHead({
  title: t('build.title'),
  meta: [
    {
      name: 'description',
      content: t('build.description'),
    },
  ],
})

defineOgImageComponent('Test', {
  headline: 'Aaron Guo',
  title: t('build.title'),
  description: t('build.description'),
})
</script>

<template>
  <main class="container max-w-5xl mx-auto px-4 py-12">
    <!-- Page Header -->
    <div class="mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {{ t('build.title') }}
      </h1>
      <p class="text-xl text-muted-foreground leading-relaxed">
        {{ t('build.subtitle') }}
      </p>
    </div>

    <!-- Project Cards -->
    <div class="flex flex-col gap-8">
      <div
        v-for="project in projects"
        :key="project.name"
        class="border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors duration-200"
      >
        <!-- Logo -->
        <div class="mb-4">
          <img
            v-if="project.logo"
            :src="project.logo"
            :alt="`${project.name} logo`"
            class="h-12 w-auto object-contain"
          />
          <div
            v-else
            class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center"
          >
            <Icon name="heroicons:cube" class="w-6 h-6 text-muted-foreground" />
          </div>
        </div>

        <!-- Title + Status -->
        <div class="flex items-center gap-3 mb-2">
          <h3 class="text-xl font-semibold text-foreground">
            {{ project.name }}
          </h3>
          <span
            v-if="project.status === 'building'"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            {{ t('build.building') }}
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
            {{ t('build.shipped') }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-muted-foreground leading-relaxed mb-4">
          {{ t(project.descriptionKey) }}
        </p>

        <!-- Tech Stack + Links -->
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tech in project.tech"
              :key="tech"
              class="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground font-medium"
            >
              {{ tech }}
            </span>
          </div>
          <span class="text-border">|</span>
          <div class="flex items-center gap-3">
            <a
              v-if="project.github"
              :href="project.github"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="mdi:github" class="w-4 h-4" />
              {{ t('build.viewSource') }}
            </a>
            <a
              v-if="project.demo"
              :href="project.demo"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
              {{ t('build.viewDemo') }}
            </a>
            <NuxtLink
              v-if="project.blog"
              :to="project.blog"
              class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="heroicons:document-text" class="w-4 h-4" />
              {{ t('build.readMore') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Screenshots -->
        <div v-if="project.screenshots?.length" class="mt-5 grid grid-cols-3 gap-3">
          <div
            v-for="(screenshot, i) in project.screenshots"
            :key="i"
            class="aspect-video rounded-lg bg-secondary overflow-hidden"
          >
            <img
              :src="screenshot"
              :alt="`${project.name} screenshot ${i + 1}`"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
