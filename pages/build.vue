<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

/**
 * Query project entries from both locale collections (pre-rendered at build)
 */
const { data } = await useAsyncData('build-projects', () =>
  Promise.all([
    queryCollection('projectsEn').all(),
    queryCollection('projectsZh').all(),
  ]),
)

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
  demo?: string
  blog?: string
  featured?: boolean
  date?: string
}

/**
 * Normalize a content entry to a project card model.
 * Nuxt Content may expose frontmatter at root or in entry.meta.
 */
function toProjectCard(entry: { title?: string; description?: string; meta?: unknown; [key: string]: unknown }) {
  const root = entry as unknown as ProjectMeta
  const meta = (entry.meta || root) as ProjectMeta
  return {
    name: entry.title || meta?.title || root?.title || 'Project',
    description: entry.description ?? meta?.description ?? root?.description ?? '',
    status: (meta?.status === 'shipped' || root?.status === 'shipped' ? 'shipped' : 'building') as 'shipped' | 'building',
    tech: Array.isArray(meta?.tech) ? meta.tech : Array.isArray(root?.tech) ? root.tech : [],
    published: Boolean(meta?.published ?? root?.published ?? true),
    logo: meta?.logo ?? root?.logo,
    screenshots: Array.isArray(meta?.screenshots) ? meta.screenshots : Array.isArray(root?.screenshots) ? root.screenshots : undefined,
    github: meta?.github ?? root?.github,
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
  const published =
    process.env.NODE_ENV === 'production'
      ? mapped.filter((p) => p.published)
      : mapped
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
  <main class="container max-w-5xl mx-auto px-4 py-12">
    <!-- Page Header -->
    <div class="mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {{ t('build.title') }}
      </h1>
      <p class="text-lg text-muted-foreground leading-relaxed">
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
    <div class="flex flex-col gap-10">
      <article
        v-for="project in projects"
        :key="project.name"
        class="group rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
      >
        <!-- Card Body -->
        <div class="p-6 md:p-8">
          <!-- Top Row: Logo + Title + Status + Links -->
          <div class="flex items-start gap-4 mb-4">
            <!-- Logo -->
            <div class="shrink-0">
              <img
                v-if="project.logo"
                :src="project.logo"
                :alt="`${project.name} logo`"
                class="w-14 h-14 rounded-xl object-contain bg-secondary p-1.5"
              />
              <div
                v-else
                class="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center"
              >
                <Icon name="heroicons:cube" class="w-7 h-7 text-muted-foreground" />
              </div>
            </div>

            <!-- Title + Status -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-xl font-semibold text-foreground">
                  {{ project.name }}
                </h2>
                <span
                  v-if="project.status === 'building'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                >
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                  </span>
                  {{ t('build.building') }}
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  <span class="w-2 h-2 rounded-full bg-green-500" />
                  {{ t('build.shipped') }}
                </span>
              </div>
              <p class="text-muted-foreground leading-relaxed">
                {{ project.description }}
              </p>
            </div>
          </div>

          <!-- Tech Stack -->
          <div v-if="project.tech?.length" class="flex flex-wrap gap-1.5 mb-5">
            <span
              v-for="tech in project.tech"
              :key="tech"
              class="px-2.5 py-1 text-xs rounded-md bg-secondary text-secondary-foreground font-medium"
            >
              {{ tech }}
            </span>
          </div>

          <!-- Action Links -->
          <div class="flex items-center gap-4">
            <a
              v-if="project.github"
              :href="project.github"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <Icon name="mdi:github" class="w-4 h-4" />
              {{ t('build.viewSource') }}
            </a>
            <a
              v-if="project.demo"
              :href="project.demo"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
              {{ t('build.viewDemo') }}
            </a>
            <NuxtLink
              v-if="project.blog"
              :to="project.blog"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <Icon name="heroicons:document-text" class="w-4 h-4" />
              {{ t('build.readMore') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Screenshots -->
        <div v-if="project.screenshots?.length" class="border-t border-border bg-secondary/30 p-6 md:p-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              v-for="(screenshot, i) in project.screenshots"
              :key="i"
              class="aspect-video rounded-lg overflow-hidden bg-secondary cursor-pointer ring-1 ring-border hover:ring-primary/40 transition-all duration-200 hover:shadow-lg"
              @click="openLightbox(screenshot, project.name)"
            >
              <img
                :src="screenshot"
                :alt="`${project.name} screenshot ${i + 1}`"
                class="w-full h-full object-cover"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
            </button>
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
