<script setup lang="ts">
import { seoData } from '~/data'
import { formatNoteDate, formatNoteNumber } from '~/utils/notes'
import { useSeo } from '~/utils/seo'

definePageMeta({
  name: 'notes-single',
})

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const collection = computed(() => (locale.value === 'zh' ? 'notesZh' : 'notesEn'))
const normalizedRoutePath = computed(() => route.path.replace(/\/+$/, '') || '/')

const { data: note } = await useAsyncData(
  `builder-note-${normalizedRoutePath.value}`,
  () =>
    queryCollection(collection.value as 'notesEn' | 'notesZh')
      .path(normalizedRoutePath.value)
      .first(),
  { watch: [normalizedRoutePath] },
)

if (!note.value || (process.env.NODE_ENV === 'production' && note.value.published !== true)) {
  throw createError({ statusCode: 404, statusMessage: 'Note not found' })
}

const noteTitle = computed(() => note.value?.title || '')
const noteDescription = computed(() => note.value?.description || note.value?.summary || '')
const noteDate = computed(() => note.value?.date || '')
const noteTopics = computed(() => note.value?.topics || [])
const noteNumber = computed(() => formatNoteNumber(note.value?.number))
const formattedDate = computed(() =>
  formatNoteDate(noteDate.value, locale.value === 'zh' ? 'zh-CN' : 'en-US'),
)
const canonicalUrl = computed(() => `${seoData.mySite}${normalizedRoutePath.value}`)
const shareOnXUrl = computed(
  () =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(noteTitle.value)}&url=${encodeURIComponent(canonicalUrl.value)}`,
)
const shareOnLinkedInUrl = computed(
  () =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl.value)}`,
)

useSeo({
  title: noteTitle.value,
  description: noteDescription.value,
  url: normalizedRoutePath.value,
  type: 'article',
  publishedTime: noteDate.value ? `${noteDate.value}T00:00:00.000Z` : undefined,
  tags: noteTopics.value,
  locale: locale.value === 'zh' ? 'zh_CN' : 'en_US',
})

defineOgImageComponent('Note', {
  title: noteTitle.value,
  description: note.value?.hook || noteDescription.value,
  number: noteNumber.value,
})

const { useScrollDepthTracking } = useRybbitAnalytics()
useScrollDepthTracking(normalizedRoutePath.value)
</script>

<template>
  <main class="container mx-auto max-w-6xl px-4 pb-20 pt-6 sm:pt-10">
    <article class="mx-auto max-w-3xl">
      <NuxtLink
        :to="localePath('/notes')"
        class="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
      >
        <Icon name="heroicons:arrow-left" class="h-4 w-4" />
        {{ t('notes.back') }}
      </NuxtLink>

      <header class="border-y border-[color:var(--line-subtle)] py-8 sm:py-10">
        <div
          class="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          <span class="text-[color:var(--notes-accent)]">
            {{ t('notes.noteLabel') }} {{ noteNumber }}
          </span>
          <span aria-hidden="true" class="h-px w-6 bg-border"></span>
          <time :datetime="noteDate">{{ formattedDate }}</time>
        </div>

        <h1
          class="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl"
        >
          {{ noteTitle }}
        </h1>
        <p class="mt-6 text-xl font-medium leading-8 text-foreground/85 sm:text-2xl sm:leading-9">
          {{ note?.hook }}
        </p>

        <div class="mt-7 flex flex-wrap gap-2">
          <span
            v-for="topic in noteTopics"
            :key="topic"
            class="rounded-full border border-[color:var(--line-control)] bg-card/60 px-3 py-1 text-xs text-muted-foreground"
          >
            {{ topic }}
          </span>
        </div>
      </header>

      <figure
        v-if="note?.image"
        class="mt-8 overflow-hidden rounded-xl border border-[color:var(--line-card)] bg-card sm:mt-10"
      >
        <NuxtImg
          :src="note.image"
          :alt="note.alt || noteTitle"
          width="1536"
          height="864"
          sizes="(max-width: 767px) 100vw, 768px"
          format="webp"
          quality="82"
          preload
          class="aspect-[16/9] w-full object-cover"
        />
      </figure>

      <div
        class="prose prose-zinc mx-auto max-w-none py-9 prose-p:text-[17px] prose-p:leading-8 prose-p:text-foreground/85 dark:prose-invert sm:py-12 sm:prose-p:text-lg"
      >
        <ContentRenderer v-if="note" :value="note" />
      </div>

      <footer class="border-t border-[color:var(--line-subtle)] pt-7">
        <p class="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {{ t('notes.closing') }}
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <a
            :href="shareOnXUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 items-center gap-2 rounded-md border border-[color:var(--line-control)] bg-card/60 px-3.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-[color:var(--notes-border-hover)] hover:bg-[var(--notes-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
            :aria-label="t('notes.shareOnX')"
          >
            <Icon name="simple-icons:x" class="h-3.5 w-3.5" />
            X
          </a>
          <a
            :href="shareOnLinkedInUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 items-center gap-2 rounded-md border border-[color:var(--line-control)] bg-card/60 px-3.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-[color:var(--notes-border-hover)] hover:bg-[var(--notes-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
            :aria-label="t('notes.shareOnLinkedIn')"
          >
            <Icon name="mdi:linkedin" class="h-4 w-4" />
            LinkedIn
          </a>
        </div>
      </footer>
    </article>
  </main>
</template>
