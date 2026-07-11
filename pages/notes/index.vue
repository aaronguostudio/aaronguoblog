<script setup lang="ts">
import type { NoteCardData, NoteContentItem } from '~/utils/notes'
import { prepareNotes } from '~/utils/notes'
import { useSeo } from '~/utils/seo'

const { locale, t } = useI18n()

const { data } = await useAsyncData('all-builder-notes', () =>
  Promise.all([queryCollection('notesEn').all(), queryCollection('notesZh').all()]),
)

const notes = computed(() => {
  if (!data.value) return []

  const items = data.value[locale.value === 'zh' ? 1 : 0] as unknown as NoteContentItem[]
  return prepareNotes(items, { includeDrafts: process.env.NODE_ENV !== 'production' })
})

const notesByYear = computed(() => {
  return notes.value.reduce<Array<{ year: string; notes: NoteCardData[] }>>((groups, note) => {
    const year = note.date.slice(0, 4) || '—'
    const existingGroup = groups.find((group) => group.year === year)

    if (existingGroup) existingGroup.notes.push(note)
    else groups.push({ year, notes: [note] })

    return groups
  }, [])
})

const canonicalPath = computed(() => (locale.value === 'zh' ? '/zh/notes' : '/notes'))

useSeo({
  title: t('notes.title'),
  description: t('notes.description'),
  url: canonicalPath.value,
  locale: locale.value === 'zh' ? 'zh_CN' : 'en_US',
})

defineOgImageComponent('Note', {
  title: t('notes.title'),
  description: t('notes.description'),
  number: t('notes.ongoing'),
})
</script>

<template>
  <main class="container mx-auto max-w-6xl px-4 pb-20 pt-8 sm:pt-12">
    <section
      class="border-b border-[color:var(--line-subtle)] pb-10 sm:pb-12"
      aria-labelledby="notes-title"
    >
      <p
        class="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--notes-accent)]"
      >
        {{ t('notes.eyebrow') }}
      </p>

      <div class="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div class="max-w-3xl">
          <h1
            id="notes-title"
            class="text-5xl font-semibold tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl"
          >
            {{ t('notes.title') }}
          </h1>
          <p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {{ t('notes.description') }}
          </p>
        </div>

        <div
          class="flex items-center gap-3 self-start rounded-full border border-[color:var(--line-control)] bg-card/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground lg:self-auto"
        >
          <span class="h-2 w-2 rounded-full bg-[var(--notes-accent)]" aria-hidden="true"></span>
          {{ t('notes.count', { count: notes.length }) }}
        </div>
      </div>
    </section>

    <section v-if="notes.length" class="py-10 sm:py-14" :aria-label="t('notes.archiveLabel')">
      <div
        v-for="group in notesByYear"
        :key="group.year"
        class="grid gap-6 border-b border-[color:var(--line-subtle)] pb-10 last:border-b-0 last:pb-0 lg:grid-cols-[7rem_minmax(0,44rem)] lg:gap-10"
      >
        <aside class="lg:pt-1">
          <p
            class="font-mono text-sm font-medium tracking-[0.18em] text-[color:var(--notes-accent)] lg:sticky lg:top-28"
          >
            {{ group.year }}
          </p>
        </aside>

        <div class="space-y-5">
          <NotesCard
            v-for="(note, index) in group.notes"
            :key="note.path"
            :note="note"
            :index="index"
          />
        </div>
      </div>
    </section>

    <section v-else class="py-24 text-center">
      <Icon
        name="heroicons:pencil-square"
        class="mx-auto mb-5 h-8 w-8 text-[color:var(--notes-accent)]"
      />
      <p class="text-lg text-muted-foreground">{{ t('notes.empty') }}</p>
    </section>

    <aside
      class="mt-6 grid gap-5 border-t border-[color:var(--line-subtle)] pt-8 sm:grid-cols-[10rem_minmax(0,1fr)]"
      aria-labelledby="notes-rules-title"
    >
      <h2
        id="notes-rules-title"
        class="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
      >
        {{ t('notes.whatLivesHere') }}
      </h2>
      <ol class="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <li class="flex items-center gap-3">
          <span class="font-mono text-[color:var(--notes-accent)]">01</span>
          {{ t('notes.ruleClaim') }}
        </li>
        <li class="flex items-center gap-3">
          <span class="font-mono text-[color:var(--notes-accent)]">02</span>
          {{ t('notes.ruleObservation') }}
        </li>
        <li class="flex items-center gap-3">
          <span class="font-mono text-[color:var(--notes-accent)]">03</span>
          {{ t('notes.ruleImplication') }}
        </li>
      </ol>
    </aside>
  </main>
</template>
