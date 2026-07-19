<script setup lang="ts">
import type { Component } from 'vue'
import type { LearnContentItem } from '~/utils/learn'
import { getLearnSlug } from '~/utils/learn'
import { useSeo } from '~/utils/seo'

definePageMeta({ name: 'learn-concept' })

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const collection = computed(() => (locale.value === 'zh' ? 'learnZh' : 'learnEn'))
const normalizedRoutePath = computed(() => route.path.replace(/\/+$/, '') || '/')

const { data: rawConcept } = await useAsyncData(
  `learn-concept-${normalizedRoutePath.value}`,
  () =>
    queryCollection(collection.value as 'learnEn' | 'learnZh')
      .path(normalizedRoutePath.value)
      .first(),
  { watch: [normalizedRoutePath] },
)

if (
  !rawConcept.value ||
  (process.env.NODE_ENV === 'production' && rawConcept.value.published !== true)
) {
  throw createError({ statusCode: 404, statusMessage: 'Concept not found' })
}

const concept = computed(() => rawConcept.value as unknown as LearnContentItem)
const conceptSlug = computed(() => getLearnSlug(normalizedRoutePath.value))
const formattedDate = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${concept.value.updated}T12:00:00`)),
)

interface VisualModule {
  default: Component
}

const visualModules = import.meta.glob<VisualModule>('../../components/learn/concepts/*.vue', {
  eager: true,
})
const visualComponent = computed(() => {
  const suffix = `/${conceptSlug.value}.vue`
  const match = Object.entries(visualModules).find(([file]) => file.endsWith(suffix))
  return match?.[1].default
})

useSeo({
  title: concept.value.title,
  description: concept.value.description,
  url: normalizedRoutePath.value,
  type: 'article',
  publishedTime: `${concept.value.date}T00:00:00.000Z`,
  modifiedTime: `${concept.value.updated}T00:00:00.000Z`,
  tags: concept.value.tags || [],
  locale: locale.value === 'zh' ? 'zh_CN' : 'en_US',
  image: concept.value.socialImage || '/og-image.jpg',
  imageAlt: concept.value.socialImageAlt || concept.value.title,
})

const { useScrollDepthTracking } = useRybbitAnalytics()
useScrollDepthTracking(normalizedRoutePath.value)
</script>

<template>
  <main class="container mx-auto max-w-6xl px-4 pb-24 pt-6 sm:pt-10">
    <NuxtLink
      :to="localePath('/learn')"
      class="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
    >
      <Icon name="heroicons:arrow-left" class="h-4 w-4" />
      {{ t('learn.back') }}
    </NuxtLink>

    <article>
      <header
        class="concept-hero relative overflow-hidden border-y border-[color:var(--line-subtle)] py-10 pl-5 sm:py-14 sm:pl-8 lg:py-16 lg:pl-10"
      >
        <div class="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
          <div>
            <div
              class="mb-7 flex flex-wrap items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span class="text-[color:var(--notes-accent)]"
                >{{ concept.shortName }} · {{ concept.domain }}</span
              >
              <span aria-hidden="true" class="h-px w-8 bg-[color:var(--line-control)]"></span>
              <span>{{ concept.maturity }}</span>
            </div>
            <h1
              class="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-8xl"
            >
              {{ concept.title }}
            </h1>
            <p class="mt-5 font-mono text-xs leading-6 text-muted-foreground sm:text-sm">
              {{ concept.fullName }}
            </p>
          </div>

          <dl class="border-l border-[color:var(--line-card)] pl-6 text-sm">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                {{ t('learn.lastUpdated') }}
              </dt>
              <dd class="mt-2 text-foreground">{{ formattedDate }}</dd>
            </div>
            <div class="mt-6">
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                {{ t('learn.relationships') }}
              </dt>
              <dd class="mt-2 text-foreground">{{ concept.neighbors?.length || 0 }}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        class="mental-model-grid grid gap-px overflow-hidden rounded-2xl border border-[color:var(--line-card)] bg-[color:var(--line-card)] my-8 sm:my-10 lg:grid-cols-[12rem_minmax(0,1fr)]"
        aria-labelledby="mental-model-title"
      >
        <div class="bg-card p-6">
          <p
            id="mental-model-title"
            class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--notes-accent)]"
          >
            {{ t('learn.mentalModel') }}
          </p>
        </div>
        <blockquote
          class="bg-background p-6 text-2xl font-medium leading-9 tracking-[-0.025em] text-foreground sm:p-8 sm:text-3xl sm:leading-10"
        >
          {{ concept.mentalModel }}
        </blockquote>
      </section>

      <section
        v-if="concept.cardImage"
        class="my-10 grid overflow-hidden rounded-2xl border border-[color:var(--line-card)] bg-card/50 lg:grid-cols-[minmax(0,1fr)_22rem]"
        :aria-labelledby="`visual-card-title-${conceptSlug}`"
      >
        <div class="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
          <div>
            <p
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--notes-accent)]"
            >
              {{ t('learn.visualCardEyebrow') }}
            </p>
            <h2
              :id="`visual-card-title-${conceptSlug}`"
              class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl"
            >
              {{ t('learn.visualCardTitle') }}
            </h2>
            <p class="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {{ t('learn.visualCardDescription') }}
            </p>
          </div>

          <a
            :href="concept.cardImage"
            download
            class="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-[color:var(--line-control)] bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-[color:var(--notes-border-hover)] hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
          >
            <Icon name="heroicons:arrow-down-tray" class="h-4 w-4" />
            {{ t('learn.downloadVisualCard') }}
          </a>
        </div>

        <figure class="flex items-center justify-center bg-secondary/55 p-4 sm:p-6">
          <NuxtImg
            :src="concept.cardImage"
            :alt="concept.cardImageAlt || concept.title"
            width="1080"
            height="1350"
            sizes="(max-width: 639px) 88vw, (max-width: 1023px) 480px, 352px"
            format="webp"
            quality="80"
            loading="lazy"
            class="aspect-[4/5] w-full max-w-[22rem] rounded-xl border border-[color:var(--line-subtle)] object-contain shadow-sm"
          />
        </figure>
      </section>

      <component
        :is="visualComponent"
        v-if="visualComponent"
        :locale="locale === 'zh' ? 'zh' : 'en'"
      />

      <section
        class="mt-16 grid gap-10 border-t border-[color:var(--line-subtle)] pt-12 lg:grid-cols-[12rem_minmax(0,48rem)] lg:gap-14"
        aria-labelledby="deep-dive-title"
      >
        <aside>
          <p
            id="deep-dive-title"
            class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--notes-accent)] lg:sticky lg:top-28"
          >
            {{ t('learn.deepDive') }}
          </p>
        </aside>
        <div
          class="concept-prose prose prose-zinc max-w-none prose-headings:tracking-[-0.035em] prose-h2:mt-16 prose-h2:text-3xl prose-h3:mt-10 prose-p:text-[17px] prose-p:leading-8 prose-p:text-foreground/85 prose-li:text-foreground/80 dark:prose-invert sm:prose-p:text-lg"
        >
          <ContentRenderer v-if="rawConcept" :value="rawConcept" />
        </div>
      </section>

      <section
        class="mt-16 border-t border-[color:var(--line-subtle)] pt-10"
        aria-labelledby="neighbors-title"
      >
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <p
              class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--notes-accent)]"
            >
              {{ t('learn.relationships') }}
            </p>
            <h2
              id="neighbors-title"
              class="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground"
            >
              {{ t('learn.relatedConcepts') }}
            </h2>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="neighbor in concept.neighbors"
            :key="neighbor.name"
            class="rounded-xl border border-[color:var(--line-card)] bg-card/50 p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-base font-semibold text-foreground">{{ neighbor.name }}</h3>
              <span
                class="font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--notes-accent)]"
                >{{ neighbor.category }}</span
              >
            </div>
            <p class="mt-2 font-mono text-[10px] leading-5 text-muted-foreground">
              {{ neighbor.fullName }}
            </p>
            <p class="mt-4 text-sm leading-6 text-muted-foreground">{{ neighbor.summary }}</p>
          </article>
        </div>
      </section>

      <section
        class="mt-14 border-t border-[color:var(--line-subtle)] pt-10"
        aria-labelledby="sources-title"
      >
        <p
          class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--notes-accent)]"
        >
          {{ t('learn.evidence') }}
        </p>
        <h2
          id="sources-title"
          class="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground"
        >
          {{ t('learn.sources') }}
        </h2>
        <ul class="mt-6 grid gap-3 sm:grid-cols-2">
          <li v-for="source in concept.sources" :key="source.url">
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex min-h-20 items-center justify-between gap-4 rounded-xl border border-[color:var(--line-card)] bg-card/50 p-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-[color:var(--notes-border-hover)] focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
            >
              <span>{{ source.title }}</span>
              <Icon
                name="heroicons:arrow-up-right"
                class="h-4 w-4 shrink-0 text-muted-foreground"
              />
            </a>
          </li>
        </ul>
      </section>
    </article>
  </main>
</template>

<style scoped>
.concept-hero::before {
  position: absolute;
  inset: 0;
  content: '';
  opacity: 0.3;
  background-image:
    linear-gradient(var(--line-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-subtle) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, black, transparent 90%);
}

.concept-hero::after {
  position: absolute;
  top: -6rem;
  right: -4rem;
  width: 18rem;
  height: 18rem;
  border: 1px solid var(--line-control);
  border-radius: 999px;
  content: '';
  background: color-mix(in srgb, var(--notes-accent) 14%, transparent);
  box-shadow:
    0 0 0 3rem color-mix(in srgb, var(--notes-accent) 4%, transparent),
    0 0 0 6rem color-mix(in srgb, var(--notes-accent) 2%, transparent);
}

.mental-model-grid blockquote {
  margin: 0;
}

:deep(.concept-prose table) {
  font-size: 0.9rem;
}
:deep(.concept-prose pre) {
  border-radius: 0.75rem;
}

@media (max-width: 640px) {
  .concept-hero::after {
    opacity: 0.35;
    right: -10rem;
  }
}
</style>
