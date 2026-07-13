<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const prefersReducedMotion = useReducedMotion()

/**
 * Project frontmatter shape from content/projects/{en,zh}/*.md.
 * The visual metadata keeps the ledger extensible as new public projects land.
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
  order?: number
  layout?: 'copy-media' | 'media-copy'
  tone?: string
  mediaFit?: 'cover' | 'contain'
  mediaAspect?: 'standard' | 'wide'
  mediaLabel?: string
  imageAlt?: string
}

interface ProjectCard {
  name: string
  description: string
  status: 'shipped' | 'building'
  tech: string[]
  published: boolean
  logo?: string
  screenshots?: string[]
  github?: string
  release?: string
  demo?: string
  blog?: string
  featured: boolean
  order: number
  layout: 'copy-media' | 'media-copy'
  tone?: string
  mediaFit: 'cover' | 'contain'
  mediaAspect: 'standard' | 'wide'
  mediaLabel?: string
  imageAlt?: string
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

function normalizeOrder(value: unknown) {
  const order = Number(value)
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER
}

/** Query project entries from both locale collections (pre-rendered at build). */
const { data } = await useAsyncData('build-projects', async () => {
  const [projectsEn, projectsZh] = await Promise.all([
    queryCollection('projectsEn').all(),
    queryCollection('projectsZh').all(),
  ])

  return [projectsEn.filter(isPublishedEntry), projectsZh.filter(isPublishedEntry)]
})

/** Normalize a content entry to the project-ledger model. */
function toProjectCard(entry: ContentProjectEntry): ProjectCard {
  const { root, meta } = getProjectFrontmatter(entry)
  const featured = Boolean(meta?.featured ?? root?.featured ?? false)
  const requestedLayout = meta?.layout ?? root?.layout
  const layout =
    requestedLayout === 'copy-media' || requestedLayout === 'media-copy'
      ? requestedLayout
      : featured
        ? 'copy-media'
        : 'media-copy'

  return {
    name: entry.title || meta?.title || root?.title || 'Project',
    description: entry.description ?? meta?.description ?? root?.description ?? '',
    status: meta?.status === 'shipped' || root?.status === 'shipped' ? 'shipped' : 'building',
    tech: Array.isArray(meta?.tech) ? meta.tech : Array.isArray(root?.tech) ? root.tech : [],
    published: Boolean(meta?.published ?? root?.published ?? true),
    logo: meta?.logo ?? root?.logo,
    screenshots: Array.isArray(meta?.screenshots)
      ? meta.screenshots
      : Array.isArray(root?.screenshots)
        ? root.screenshots
        : undefined,
    github: meta?.github ?? root?.github,
    release: meta?.release ?? root?.release,
    demo: meta?.demo ?? root?.demo,
    blog: meta?.blog ?? root?.blog,
    featured,
    order: normalizeOrder(meta?.order ?? root?.order),
    layout,
    tone: meta?.tone ?? root?.tone,
    mediaFit: meta?.mediaFit ?? root?.mediaFit ?? 'cover',
    mediaAspect: meta?.mediaAspect ?? root?.mediaAspect ?? 'standard',
    mediaLabel: meta?.mediaLabel ?? root?.mediaLabel,
    imageAlt: meta?.imageAlt ?? root?.imageAlt,
  }
}

/** Featured work leads; explicit frontmatter order makes later additions predictable. */
const projects = computed(() => {
  if (!data.value) return []
  const localeIndex = locale.value === 'en' ? 0 : 1
  const raw = data.value[localeIndex] || []
  const mapped = raw.map(toProjectCard)
  const published = mapped.filter((p) => p.published)

  return [...published].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.order - b.order
  })
})

const lightboxImage = ref<string | null>(null)
const lightboxProject = ref<string>('')

function openLightbox(src: string, projectName: string) {
  lightboxImage.value = src
  lightboxProject.value = projectName
}

function closeLightbox() {
  lightboxImage.value = null
}

function formatProjectNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

function getImageAlt(project: ProjectCard) {
  return project.imageAlt || `${project.name} ${t('build.projectVisual')}`
}

function getDemoLabel(project: ProjectCard) {
  return `${t('build.openProject')} ${project.name}`
}

const revealTransition = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1] as const,
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
  <div class="build-page">
    <main class="build-shell mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
      <motion.header
        class="build-intro"
        :initial="prefersReducedMotion ? false : { opacity: 0, y: 22 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="revealTransition"
      >
        <p class="build-eyebrow font-mono text-[10px] uppercase tracking-[0.2em] sm:text-[11px]">
          {{ t('build.eyebrow') }}
        </p>
        <div class="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <h1
              class="build-heading text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
            >
              {{ t('build.title') }}
            </h1>
            <p class="build-subtitle mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
              {{ t('build.subtitle') }}
            </p>
          </div>
          <p class="build-count font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px]">
            {{ t('build.projectCount', { count: String(projects.length).padStart(2, '0') }) }}
          </p>
        </div>
      </motion.header>

      <p
        v-if="projects.length === 0"
        class="build-empty border-y py-16 text-center text-muted-foreground"
      >
        {{ t('build.empty') }}
      </p>

      <section v-else class="build-project-list" :aria-label="t('build.title')">
        <motion.article
          v-for="(project, index) in projects"
          :key="project.name"
          class="build-project"
          :class="{
            'build-project--tesra': project.tone === 'tesra',
            'build-project--drumnext': project.tone === 'drumnext',
            'build-project--featured': project.featured,
          }"
          :initial="prefersReducedMotion ? false : { opacity: 0, y: 34 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ ...revealTransition, delay: index * 0.06 }"
        >
          <div
            class="build-project-dossier"
            :class="{
              'build-project-dossier--copy-media': project.layout === 'copy-media',
              'build-project-dossier--media-copy': project.layout === 'media-copy',
            }"
          >
            <button
              v-if="project.screenshots?.[0]"
              class="build-project-media group relative block w-full overflow-hidden rounded-lg border text-left outline-none"
              :class="project.mediaAspect === 'wide' ? 'aspect-[16/7]' : 'aspect-[16/10]'"
              type="button"
              :aria-label="t('build.openPreview', { project: project.name })"
              @click="openLightbox(project.screenshots[0], project.name)"
            >
              <img
                :src="project.screenshots[0]"
                :alt="getImageAlt(project)"
                class="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.018] motion-reduce:transition-none"
                :class="
                  project.mediaFit === 'contain' ? 'bg-[#f7faf8] object-contain' : 'object-cover'
                "
                loading="lazy"
                decoding="async"
              />
              <span
                v-if="project.mediaLabel"
                class="build-project-media-label font-mono text-[10px] uppercase tracking-[0.16em]"
              >
                {{ project.mediaLabel }}
              </span>
            </button>

            <div
              v-else
              class="build-project-media build-project-media--empty flex aspect-[16/10] items-center justify-center rounded-lg border"
            >
              <Icon name="heroicons:cube-transparent" class="h-9 w-9" />
            </div>

            <div class="build-project-copy flex flex-col justify-between">
              <div>
                <p
                  class="build-project-index font-mono text-[10px] uppercase tracking-[0.18em] sm:text-[11px]"
                >
                  {{ formatProjectNumber(index) }} / {{ t('build.projectLabel') }}
                </p>

                <div class="mt-7 flex items-center gap-4 sm:gap-5">
                  <img
                    v-if="project.logo"
                    :src="project.logo"
                    :alt="`${project.name} logo`"
                    class="build-project-logo h-11 w-11 shrink-0 rounded-md object-contain sm:h-12 sm:w-12"
                  />
                  <div
                    v-else
                    class="build-project-logo flex h-11 w-11 shrink-0 items-center justify-center rounded-md sm:h-12 sm:w-12"
                  >
                    <Icon name="heroicons:cube" class="h-5 w-5" />
                  </div>
                  <h2
                    class="build-project-name text-3xl font-semibold leading-none tracking-[-0.045em] sm:text-4xl"
                  >
                    {{ project.name }}
                  </h2>
                </div>

                <p
                  class="build-project-description mt-7 max-w-xl text-base leading-7 sm:text-lg sm:leading-8"
                >
                  {{ project.description }}
                </p>

                <div
                  v-if="project.tech.length"
                  class="build-project-tech mt-7 font-mono text-[10px] uppercase tracking-[0.12em] sm:text-[11px]"
                >
                  <span v-for="tech in project.tech" :key="tech">{{ tech }}</span>
                </div>
              </div>

              <div class="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-12">
                <a
                  v-if="project.demo"
                  :href="project.demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="build-primary-action group inline-flex items-center gap-2.5 rounded-md px-4 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2"
                  data-rybbit-event="outbound_click"
                  data-rybbit-prop-location="build"
                  :data-rybbit-prop-project="project.name"
                >
                  {{ getDemoLabel(project) }}
                  <Icon
                    name="heroicons:arrow-up-right"
                    class="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </a>

                <div
                  class="build-secondary-actions flex flex-wrap items-center gap-x-5 gap-y-3 text-sm"
                >
                  <a
                    v-if="project.github"
                    :href="project.github"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="build-secondary-action inline-flex items-center gap-2 outline-none focus-visible:ring-2"
                  >
                    <Icon name="mdi:github" class="h-4 w-4" />
                    {{ t('build.viewSource') }}
                  </a>
                  <a
                    v-if="project.release"
                    :href="project.release"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="build-secondary-action inline-flex items-center gap-2 outline-none focus-visible:ring-2"
                  >
                    <Icon name="heroicons:tag" class="h-4 w-4" />
                    {{ t('build.viewRelease') }}
                  </a>
                  <NuxtLink
                    v-if="project.blog"
                    :to="project.blog"
                    class="build-secondary-action inline-flex items-center gap-2 outline-none focus-visible:ring-2"
                  >
                    <Icon name="heroicons:document-text" class="h-4 w-4" />
                    {{ t('build.readMore') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      </section>
    </main>

    <Teleport to="body">
      <Transition name="build-fade">
        <div
          v-if="lightboxImage"
          class="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black/85 p-5 backdrop-blur-sm"
          @click="closeLightbox"
        >
          <button
            class="absolute right-5 top-5 rounded-full border border-white/20 bg-black/30 p-2 text-white outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
            type="button"
            :aria-label="t('build.closePreview')"
            @click.stop="closeLightbox"
          >
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
          <img
            :src="lightboxImage"
            :alt="lightboxProject"
            class="max-h-[88vh] max-w-[92vw] rounded-lg border border-white/15 object-contain shadow-2xl"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.build-page {
  --build-text: var(--foreground);
  --build-copy: color-mix(in srgb, var(--foreground) 68%, transparent);
  --build-muted: color-mix(in srgb, var(--foreground) 52%, transparent);
  --build-faint: color-mix(in srgb, var(--foreground) 38%, transparent);
  --build-line: color-mix(in srgb, var(--foreground) 12%, transparent);
  --build-line-strong: color-mix(in srgb, var(--foreground) 20%, transparent);
  --build-surface: color-mix(in srgb, var(--foreground) 3%, transparent);
  --build-accent: #3959e8;
  --build-accent-hover: #2745cc;
  --build-accent-ink: #fff;
  background: var(--background);
  color: var(--build-text);
}

:global(html.dark .build-page) {
  --build-copy: rgb(255 255 255 / 0.7);
  --build-muted: rgb(255 255 255 / 0.52);
  --build-faint: rgb(255 255 255 / 0.38);
  --build-line: rgb(255 255 255 / 0.1);
  --build-line-strong: rgb(255 255 255 / 0.18);
  --build-surface: rgb(255 255 255 / 0.035);
  --build-accent: #7085ff;
  --build-accent-hover: #91a0ff;
  --build-accent-ink: #080a12;
}

.build-intro {
  padding-top: clamp(2.75rem, 4vw, 4.25rem);
  padding-bottom: clamp(1.75rem, 2.75vw, 2.75rem);
}

.build-eyebrow,
.build-project-index {
  color: var(--build-accent);
}

.build-heading,
.build-project-name {
  color: var(--build-text);
}

.build-subtitle,
.build-project-description {
  color: var(--build-copy);
}

.build-count,
.build-project-tech,
.build-project-media-label {
  color: var(--build-muted);
}

.build-empty,
.build-project-list {
  border-color: var(--build-line);
}

.build-project-list {
  display: grid;
  gap: clamp(4rem, 7vw, 7rem);
  border-block: 1px solid var(--build-line);
  padding-block: clamp(2.25rem, 3.5vw, 3.25rem);
}

.build-project-dossier {
  display: grid;
  gap: clamp(2rem, 5vw, 5rem);
}

.build-project-media {
  border-color: var(--build-line-strong);
  background: var(--build-surface);
  color: var(--build-faint);
  transition:
    border-color 260ms ease,
    box-shadow 260ms ease;
}

.build-project-media:hover,
.build-project-media:focus-visible {
  border-color: color-mix(in srgb, var(--build-accent) 62%, var(--build-line-strong));
  box-shadow: 0 16px 48px color-mix(in srgb, var(--build-accent) 15%, transparent);
}

.build-project-media-label {
  position: absolute;
  bottom: 0.85rem;
  left: 0.85rem;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 0.25rem;
  background: rgb(9 9 11 / 0.74);
  padding: 0.45rem 0.55rem;
  color: rgb(255 255 255 / 0.72);
}

.build-project-logo {
  border: 1px solid var(--build-line-strong);
  background: var(--build-surface);
  padding: 0.18rem;
}

.build-project--tesra .build-project-logo {
  border-color: color-mix(in srgb, var(--build-accent) 62%, var(--build-line-strong));
  background: #0b0e14;
}

.build-project--drumnext {
  --build-accent: #258fe1;
  --build-accent-hover: #1676bd;
}

:global(html.dark .build-project--drumnext) {
  --build-accent: #32a5f5;
  --build-accent-hover: #68bfff;
}

.build-project--drumnext .build-project-logo {
  border-color: color-mix(in srgb, var(--build-accent) 62%, var(--build-line-strong));
  background: #0a0f16;
}

.build-project--tesra .build-project-name {
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.build-project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0;
  line-height: 1.4;
}

.build-project-tech span:not(:last-child)::after {
  content: '·';
  margin-inline: 0.65rem;
  color: var(--build-faint);
}

.build-primary-action {
  background: var(--build-accent);
  color: var(--build-accent-ink);
  --tw-ring-color: color-mix(in srgb, var(--build-accent) 42%, transparent);
}

.build-primary-action:hover {
  background: var(--build-accent-hover);
}

.build-secondary-action {
  color: var(--build-muted);
  --tw-ring-color: color-mix(in srgb, var(--build-accent) 42%, transparent);
  transition: color 180ms ease;
}

.build-secondary-action:hover {
  color: var(--build-text);
}

@media (max-width: 1023px) {
  .build-project-list {
    gap: 0;
    padding-block: 0;
  }

  .build-project {
    padding-block: 1.25rem 1.75rem;
  }

  .build-project + .build-project {
    border-top: 1px solid var(--build-line-strong);
  }

  .build-project-dossier {
    gap: 0.875rem;
  }

  .build-project-copy > .mt-9 {
    margin-top: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .build-project-dossier {
    grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
    align-items: center;
  }

  .build-project-dossier--copy-media {
    grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  }

  .build-project-copy {
    order: 2;
  }

  .build-project-media {
    order: 1;
  }

  .build-project-dossier--copy-media .build-project-copy {
    order: 1;
  }

  .build-project-dossier--copy-media .build-project-media {
    order: 2;
    transform: translateY(1.5rem);
  }

  .build-project-dossier--media-copy .build-project-media {
    transform: translateY(-0.75rem);
  }
}

.build-fade-enter-active,
.build-fade-leave-active {
  transition: opacity 0.2s ease;
}

.build-fade-enter-from,
.build-fade-leave-to {
  opacity: 0;
}
</style>
