<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

/**
 * Project frontmatter shape from content/projects/{en,zh}/*.md
 */
interface ProjectMeta {
  title?: string
  description?: string
  status?: 'shipped' | 'building'
  tech?: string[]
  published?: boolean
  logo?: string
  screenshots?: string[]
  github?: string
  release?: string
  demo?: string
  blog?: string
  featured?: boolean
  date?: string
}

type ContentProjectEntry = {
  title?: string
  description?: string
  meta?: unknown
  [key: string]: unknown
}

function getProjectFrontmatter(entry: ContentProjectEntry) {
  const root = entry as unknown as ProjectMeta
  const meta = (entry.meta || root) as ProjectMeta
  return { root, meta }
}

function isPublishedEntry(entry: ContentProjectEntry) {
  const { root, meta } = getProjectFrontmatter(entry)
  return Boolean(meta?.published ?? root?.published ?? true)
}

/**
 * Query project entries from both locale collections (pre-rendered at build)
 */
const { data } = await useAsyncData('build-projects', async () => {
  const [projectsEn, projectsZh] = await Promise.all([
    queryCollection('projectsEn').all(),
    queryCollection('projectsZh').all(),
  ])

  return [
    projectsEn.filter(isPublishedEntry),
    projectsZh.filter(isPublishedEntry),
  ]
})

/**
 * Normalize a content entry to a project card model.
 * Nuxt Content may expose frontmatter at root or in entry.meta.
 */
function toProjectCard(entry: ContentProjectEntry) {
  const { root, meta } = getProjectFrontmatter(entry)
  return {
    name: entry.title || meta?.title || root?.title || 'Project',
    description: entry.description ?? meta?.description ?? root?.description ?? '',
    status: (meta?.status === 'shipped' || root?.status === 'shipped' ? 'shipped' : 'building') as 'shipped' | 'building',
    tech: Array.isArray(meta?.tech) ? meta.tech : Array.isArray(root?.tech) ? root.tech : [],
    published: Boolean(meta?.published ?? root?.published ?? true),
    logo: meta?.logo ?? root?.logo,
    screenshots: Array.isArray(meta?.screenshots) ? meta.screenshots : Array.isArray(root?.screenshots) ? root.screenshots : undefined,
    github: meta?.github ?? root?.github,
    release: meta?.release ?? root?.release,
    demo: meta?.demo ?? root?.demo,
    blog: meta?.blog ?? root?.blog,
  }
}

/**
 * Projects for the current locale, filtered and ordered (shipped first, then building)
 */
const projects = computed(() => {
  if (!data.value) return []
  const localeIndex = locale.value === 'en' ? 0 : 1
  const raw = data.value[localeIndex] || []
  const mapped = raw.map(toProjectCard)
  const published = mapped.filter((p) => p.published)
  return [...published].sort((a, b) =>
    a.status === b.status ? 0 : a.status === 'shipped' ? -1 : 1,
  )
})

/**
 * Lightbox state for screenshot previews
 */
const lightboxImage = ref<string | null>(null)
const lightboxProject = ref<string>('')

function openLightbox(src: string, projectName: string) {
  lightboxImage.value = src
  lightboxProject.value = projectName
}
function closeLightbox() {
  lightboxImage.value = null
}

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
  <main class="container max-w-6xl mx-auto px-4 py-10 md:py-14">
    <!-- Page Header -->
    <div class="mb-10 max-w-3xl">
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-3">
        {{ t('build.title') }}
      </h1>
      <p class="text-base md:text-lg text-muted-foreground leading-relaxed">
        {{ t('build.subtitle') }}
      </p>
    </div>

    <!-- Empty State -->
    <p
      v-if="projects.length === 0"
      class="text-muted-foreground py-8"
    >
      {{ t('build.empty') }}
    </p>

    <!-- Project Cards -->
    <div class="flex flex-col gap-6">
      <article
        v-for="project in projects"
        :key="project.name"
        class="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/25 hover:shadow-lg"
      >
        <!-- Featured Banner -->
        <button
          v-if="project.screenshots?.[0]"
          class="build-featured-preview block w-full overflow-hidden border-b border-border bg-[#f7faf8] text-left transition-colors hover:bg-[#f4f8f5]"
          @click="openLightbox(project.screenshots[0], project.name)"
        >
          <img
            :src="project.screenshots[0]"
            :alt="`${project.name} screenshot`"
            class="w-full bg-[#f7faf8] object-contain transition-transform duration-300 group-hover:scale-[1.005]"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </button>

        <div
          v-else
          class="flex min-h-[220px] items-center justify-center border-b border-border bg-secondary/35 p-6"
        >
          <div
            class="flex h-24 w-24 items-center justify-center rounded-lg border border-border bg-background"
          >
            <Icon name="heroicons:cube-transparent" class="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        <div>
          <!-- Project Story -->
          <div class="flex flex-col justify-between gap-8 p-6 md:p-8 lg:p-10">
            <div>
              <div class="mb-5 flex flex-wrap items-center gap-3">
                <img
                  v-if="project.logo"
                  :src="project.logo"
                  :alt="`${project.name} logo`"
                  class="h-16 w-16 rounded-xl bg-secondary object-contain p-1.5"
                />
                <div
                  v-else
                  class="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary"
                >
                  <Icon name="heroicons:cube" class="h-8 w-8 text-muted-foreground" />
                </div>
                <span
                  v-if="project.status === 'building'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400"
                >
                  <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                    <span class="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
                  </span>
                  {{ t('build.building') }}
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400"
                >
                  <span class="h-2 w-2 rounded-full bg-green-500" />
                  {{ t('build.shipped') }}
                </span>
              </div>

              <h2 class="mb-3 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
                {{ project.name }}
              </h2>
              <p class="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {{ project.description }}
              </p>

              <div
                v-if="project.tech?.length"
                class="mt-6 flex flex-wrap gap-2"
              >
                <span
                  v-for="tech in project.tech"
                  :key="tech"
                  class="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <!-- Action Links -->
            <div class="flex flex-wrap items-center gap-3">
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <Icon name="mdi:github" class="h-4 w-4" />
                {{ t('build.viewSource') }}
              </a>
              <a
                v-if="project.demo"
                :href="project.demo"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" />
                {{ t('build.viewDemo') }}
              </a>
              <a
                v-if="project.release"
                :href="project.release"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <Icon name="heroicons:tag" class="h-4 w-4" />
                {{ t('build.viewRelease') }}
              </a>
              <NuxtLink
                v-if="project.blog"
                :to="project.blog"
                class="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <Icon name="heroicons:document-text" class="h-4 w-4" />
                {{ t('build.readMore') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxImage"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
          @click="closeLightbox"
        >
          <button
            class="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            @click.stop="closeLightbox"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6 text-white" />
          </button>
          <img
            :src="lightboxImage"
            :alt="lightboxProject"
            class="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
