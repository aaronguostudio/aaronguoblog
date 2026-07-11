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
          class="signal-row group grid w-full gap-4 py-5 text-left outline-none transition-colors sm:grid-cols-[8rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-6"
          :aria-expanded="openSlug === thread.slug"
          :aria-controls="`signal-thread-${thread.slug}`"
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

          <span class="flex items-center gap-2 text-xs text-muted-foreground sm:justify-end">
            <span class="hidden lg:inline">
              {{ openSlug === thread.slug ? collapseLabel : expandLabel }}
            </span>
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
          class="pb-8 sm:pl-[9.5rem]"
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

          <div v-if="thread.matchedSignals.length > 0" class="signal-rule mt-7 border-t pt-5">
            <p
              class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground opacity-70"
            >
              {{ supportingSignalsLabel }}
            </p>
            <div class="mt-3 flex flex-col gap-2">
              <a
                v-for="signal in thread.matchedSignals.slice(0, 2)"
                :key="signal.id"
                :href="signal.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex max-w-3xl items-center gap-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-[var(--signal-accent)]"
              >
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal-accent)]" />
                <span class="line-clamp-1">{{ signal.title }}</span>
                <Icon name="heroicons:arrow-up-right" class="h-3.5 w-3.5 shrink-0" />
              </a>
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
