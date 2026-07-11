<script setup lang="ts">
import type { NoteCardData } from '~/utils/notes'
import { formatNoteDate, formatNoteNumber } from '~/utils/notes'

const props = withDefaults(
  defineProps<{
    note: NoteCardData
    index?: number
  }>(),
  {
    index: 0,
  },
)

const { locale, t } = useI18n()
const localePath = useLocalePath()

const formattedDate = computed(() =>
  formatNoteDate(props.note.date, locale.value === 'zh' ? 'zh-CN' : 'en-US'),
)
const noteNumber = computed(() => formatNoteNumber(props.note.number, props.index))
</script>

<template>
  <article
    data-testid="note-card"
    class="group rounded-xl border border-[color:var(--line-card)] bg-card/60 p-5 transition-colors duration-200 hover:border-[color:var(--notes-border-hover)] hover:bg-[var(--notes-surface-hover)] sm:p-7"
  >
    <header
      class="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
    >
      <span class="font-mono text-[color:var(--notes-accent)]">
        {{ t('notes.noteLabel') }} {{ noteNumber }}
      </span>
      <span aria-hidden="true" class="h-px w-6 bg-border"></span>
      <time :datetime="note.date" class="font-mono">{{ formattedDate }}</time>
    </header>

    <NuxtLink
      v-if="note.image"
      :to="localePath(note.path)"
      class="mb-6 block overflow-hidden rounded-lg border border-[color:var(--line-card)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
      :aria-label="`${t('notes.readNote')}: ${note.title}`"
    >
      <NuxtImg
        :src="note.image"
        :alt="note.alt || note.title"
        width="1120"
        height="630"
        sizes="(max-width: 767px) 100vw, 704px"
        format="webp"
        quality="82"
        loading="lazy"
        class="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </NuxtLink>

    <h2 class="mb-4 text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
      <NuxtLink
        :to="localePath(note.path)"
        class="rounded-sm outline-none transition-colors hover:text-[color:var(--notes-accent)] focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        {{ note.title }}
      </NuxtLink>
    </h2>

    <p class="mb-4 text-lg font-medium leading-7 text-foreground/90 sm:text-xl">
      {{ note.hook }}
    </p>
    <p class="text-base leading-7 text-muted-foreground sm:text-[17px]">
      {{ note.summary }}
    </p>

    <footer
      class="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-[color:var(--line-subtle)] pt-5"
    >
      <div class="flex flex-wrap gap-2">
        <span
          v-for="topic in note.topics"
          :key="topic"
          class="rounded-full border border-[color:var(--line-control)] bg-background/70 px-2.5 py-1 text-xs text-muted-foreground"
        >
          {{ topic }}
        </span>
      </div>

      <NuxtLink
        :to="localePath(note.path)"
        class="inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-medium text-foreground outline-none transition-colors hover:text-[color:var(--notes-accent)] focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
        :aria-label="`${t('notes.readNote')}: ${note.title}`"
      >
        {{ t('notes.readNote') }}
        <Icon name="heroicons:arrow-up-right" class="h-4 w-4" />
      </NuxtLink>
    </footer>
  </article>
</template>
