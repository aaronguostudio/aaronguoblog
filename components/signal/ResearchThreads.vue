<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'
import type { SignalThreadCard } from '~/utils/signal-threads'

const props = defineProps<{
  threads: SignalThreadCard[]
  openSlug: string
  heading: string
  description: string
  nowLabel: string
  emergingLabel: string
  watchLabel: string
  thesisLabel: string
  takeLabel: string
  questionLabel: string
  productAngleLabel: string
  supportingSignalsLabel: string
  deepReadSectionLabel: string
  deepReadQuestionLabel: string
  deepReadSynthesisLabel: string
  deepReadEvidenceLabel: string
  deepReadCaveatLabel: string
  deepReadReadAtLabel: string
  selectedSourceLabel: string
  deepReadLabel: string
  researchNoteLabel: string
  archivedSourceLabel: string
  relatedItemsLabel: string
  exploreRelatedLabel: string
  exploreAllLabel: string
  expandLabel: string
  collapseLabel: string
}>()

const emit = defineEmits<{
  'update:openSlug': [slug: string]
  exploreTopic: [topicSlug: string]
  exploreAll: []
}>()

const prefersReducedMotion = useReducedMotion()

const horizonMeta = computed(() => ({
  now: {
    label: props.nowLabel,
    icon: 'ph:pulse',
    labelClass: 'text-cyan-700 dark:text-cyan-300',
    dotClass: 'bg-cyan-600 dark:bg-cyan-300',
  },
  emerging: {
    label: props.emergingLabel,
    icon: 'ph:circles-three-plus',
    labelClass: 'text-violet-700 dark:text-violet-300',
    dotClass: 'bg-violet-600 dark:bg-violet-300',
  },
  watch: {
    label: props.watchLabel,
    icon: 'ph:eye',
    labelClass: 'text-amber-700 dark:text-amber-300',
    dotClass: 'bg-amber-600 dark:bg-amber-300',
  },
}))

function toggleThread(slug: string) {
  emit('update:openSlug', props.openSlug === slug ? '' : slug)
}
</script>

<template>
  <section
    v-if="threads.length > 0"
    id="signal-horizon"
    class="signal-rule scroll-mt-28 border-b py-12 lg:py-16"
  >
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="signal-accent font-mono text-[10px] uppercase tracking-[0.18em]">
          Signal horizon
        </p>
        <h2 class="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
          {{ heading }}
        </h2>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="signal-rule border-y">
      <article
        v-for="thread in threads"
        :key="thread.slug"
        class="signal-rule border-b last:border-b-0"
      >
        <button
          type="button"
          class="signal-row group grid w-full gap-4 px-5 py-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--signal-accent)] sm:grid-cols-[8rem_minmax(0,1fr)_auto_auto] sm:gap-6 sm:px-6 sm:py-6"
          :aria-expanded="openSlug === thread.slug"
          :aria-controls="`signal-thread-${thread.slug}`"
          :aria-label="`${openSlug === thread.slug ? collapseLabel : expandLabel}: ${thread.title}`"
          @click="toggleThread(thread.slug)"
        >
          <span class="flex items-center gap-3">
            <Icon :name="horizonMeta[thread.horizon].icon" class="h-5 w-5 text-muted-foreground" />
            <span
              class="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]"
              :class="horizonMeta[thread.horizon].labelClass"
            >
              {{ horizonMeta[thread.horizon].label }}
            </span>
          </span>

          <span class="flex min-w-0 items-center gap-4">
            <span
              class="hidden h-2 w-2 shrink-0 rounded-full sm:block"
              :class="horizonMeta[thread.horizon].dotClass"
            />
            <span
              class="text-base font-medium leading-snug text-foreground opacity-80 transition-opacity group-hover:opacity-100 sm:text-lg"
            >
              {{ thread.title }}
            </span>
          </span>

          <span class="font-mono text-[10px] text-muted-foreground opacity-75 sm:text-right">
            {{ thread.relatedSignalCount }} {{ relatedItemsLabel }}
          </span>

          <span class="signal-disclosure flex h-9 w-9 items-center justify-center rounded-md border" aria-hidden="true">
            <Icon
              name="heroicons:chevron-down"
              class="h-4 w-4 transition-transform duration-300 motion-reduce:transition-none"
              :class="openSlug === thread.slug ? 'signal-accent rotate-180' : ''"
            />
          </span>
        </button>

        <motion.div
          v-if="openSlug === thread.slug"
          :id="`signal-thread-${thread.slug}`"
          class="px-5 pb-8 pt-1 sm:pr-6 sm:pl-[10.5rem]"
          :initial="prefersReducedMotion ? false : { opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }"
        >
          <div class="signal-rule grid gap-7 border-l pl-5 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-8">
            <div>
              <p
                class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-75"
              >
                {{ thesisLabel }}
              </p>
              <p class="mt-3 text-base leading-7 text-foreground opacity-75">
                {{ thread.thesis }}
              </p>
            </div>
            <div>
              <p class="signal-accent font-mono text-[10px] uppercase tracking-[0.16em] opacity-80">
                {{ takeLabel }}
              </p>
              <p class="mt-3 text-base leading-7 text-foreground opacity-75">
                {{ thread.builderImplication }}
              </p>
            </div>
            <div>
              <p
                class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-75"
              >
                {{ questionLabel }}
              </p>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                {{ thread.openQuestion }}
              </p>
            </div>
            <div>
              <p
                class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-75"
              >
                {{ productAngleLabel }}
              </p>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                {{ thread.productHypothesis }}
              </p>
            </div>
          </div>

          <section v-if="thread.deepRead" class="signal-rule mt-7 border-t pt-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="signal-accent font-mono text-[10px] uppercase tracking-[0.16em]">
                  {{ deepReadSectionLabel }}
                </p>
                <h3 class="mt-2 text-xl font-medium tracking-[-0.02em] text-foreground">
                  {{ thread.deepRead.title }}
                </h3>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground opacity-75 sm:pt-1">
                {{ deepReadReadAtLabel }} {{ thread.deepRead.readAt }}
              </span>
            </div>

            <div class="mt-6 grid gap-7 border-l pl-5 lg:grid-cols-2 lg:gap-x-12">
              <div>
                <p
                  class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-75"
                >
                  {{ deepReadQuestionLabel }}
                </p>
                <p class="mt-3 text-sm leading-6 text-foreground opacity-80">
                  {{ thread.deepRead.question }}
                </p>
              </div>
              <div>
                <p
                  class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-75"
                >
                  {{ deepReadSynthesisLabel }}
                </p>
                <p class="mt-3 text-sm leading-7 text-foreground opacity-80">
                  {{ thread.deepRead.synthesis }}
                </p>
              </div>
            </div>

            <div class="mt-7 border-t pt-5">
              <p
                class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-70"
              >
                {{ deepReadEvidenceLabel }}
              </p>
              <div class="mt-3 grid gap-4 lg:grid-cols-3">
                <article
                  v-for="source in thread.deepRead.sources"
                  :key="source.url"
                  class="border-l border-[var(--signal-accent)]/30 pl-4"
                >
                  <a
                    :href="source.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-medium text-foreground transition-colors hover:text-[var(--signal-accent)]"
                  >
                    {{ source.title }}
                    <Icon name="heroicons:arrow-up-right" class="ml-1 inline h-3.5 w-3.5" />
                  </a>
                  <p class="mt-2 text-xs leading-6 text-muted-foreground">
                    {{ source.finding }}
                  </p>
                </article>
              </div>
            </div>

            <div class="mt-6 border border-border/70 px-4 py-3">
              <p
                class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-70"
              >
                {{ deepReadCaveatLabel }}
              </p>
              <p class="mt-2 text-xs leading-6 text-muted-foreground">
                {{ thread.deepRead.caveat }}
              </p>
            </div>
          </section>

          <div v-if="thread.matchedSignals.length > 0" class="signal-rule mt-7 border-t pt-5">
            <p
              class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-70"
            >
              {{ supportingSignalsLabel }}
            </p>
            <div class="mt-3 flex flex-col gap-4">
              <div
                v-for="signal in thread.matchedSignals.slice(0, 2)"
                :key="signal.id"
                class="max-w-3xl"
              >
                <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <a
                    :href="signal.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-[var(--signal-accent)]"
                  >
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal-accent)]" />
                    <span class="line-clamp-1">{{ signal.title }}</span>
                    <Icon name="heroicons:arrow-up-right" class="h-3.5 w-3.5 shrink-0" />
                  </a>
                  <span
                    v-if="signal.readingStage"
                    class="signal-accent rounded-full border border-[var(--signal-accent)]/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
                  >
                    {{ signal.readingStage === 'deep-read' ? deepReadLabel : selectedSourceLabel }}
                  </span>
                  <span
                    v-if="!signal.isAvailable"
                    class="rounded-full border border-border/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {{ archivedSourceLabel }}
                  </span>
                </div>
                <p
                  v-if="signal.note"
                  class="mt-2 border-l border-[var(--signal-accent)]/30 pl-4 text-xs leading-6 text-muted-foreground"
                >
                  <span class="font-mono text-[9px] uppercase tracking-[0.14em] opacity-65">
                    {{ researchNoteLabel }}
                  </span>
                  <span class="mt-1 block">{{ signal.note }}</span>
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="signal-accent group mt-7 inline-flex items-center gap-3 text-sm font-medium outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)]"
            @click="emit('exploreTopic', thread.primaryTopicSlug)"
          >
            {{ exploreRelatedLabel }}
            <Icon
              name="heroicons:arrow-right"
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </button>
        </motion.div>
      </article>
    </div>

    <div class="mt-7 flex justify-end">
      <button
        type="button"
        class="group inline-flex items-center gap-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)]"
        @click="emit('exploreAll')"
      >
        {{ exploreAllLabel }}
        <Icon
          name="heroicons:arrow-right"
          class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </button>
    </div>
  </section>
</template>
