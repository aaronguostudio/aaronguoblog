<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'

type SignalHeroEvidence = {
  id: string
  url: string
  title: string
  sourceLabel: string
  sourceIcon: string
  publishedLabel: string
}

const props = defineProps<{
  eyebrow: string
  headline: string
  whyLabel: string
  whyText: string
  evidenceLabel: string
  evidenceItems: SignalHeroEvidence[]
  moreEvidenceLabel: string
  topicLabel: string
  thesisLabel: string
  thesis: string
  exploreLabel: string
  readTakeLabel: string
}>()

const emit = defineEmits<{
  explore: []
  readTake: []
}>()

const prefersReducedMotion = useReducedMotion()
const showAllEvidence = ref(false)

const visibleEvidence = computed(() =>
  showAllEvidence.value ? props.evidenceItems : props.evidenceItems.slice(0, 3),
)
const hiddenEvidenceCount = computed(() =>
  Math.max(0, props.evidenceItems.length - visibleEvidence.value.length),
)

const revealTransition = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1] as const,
}
</script>

<template>
  <section class="signal-rule border-b py-12 sm:py-14 lg:py-16">
    <motion.div
      class="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(34rem,1.18fr)] lg:items-center lg:gap-14"
      :initial="prefersReducedMotion ? false : { opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="revealTransition"
    >
      <div class="min-w-0">
        <p class="signal-accent font-mono text-[11px] uppercase tracking-[0.18em]">
          {{ eyebrow }}
        </p>
        <h1
          class="mt-6 max-w-[15ch] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.5rem]"
        >
          {{ headline }}
        </h1>
        <p class="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          <span class="font-medium text-foreground">{{ whyLabel }}:</span>
          {{ whyText }}
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            class="signal-primary-button group inline-flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            @click="emit('explore')"
          >
            {{ exploreLabel }}
            <Icon
              name="heroicons:arrow-right"
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </button>
          <button
            type="button"
            class="group inline-flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)]"
            @click="emit('readTake')"
          >
            {{ readTakeLabel }}
            <Icon
              name="heroicons:arrow-right"
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </button>
        </div>
      </div>

      <div class="min-w-0">
        <p
          class="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground opacity-75"
        >
          {{ evidenceLabel }}
        </p>

        <div
          class="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_4.5rem_minmax(12rem,0.72fr)]"
        >
          <div class="signal-divide signal-rule min-w-0 divide-y border-y">
            <a
              v-for="item in visibleEvidence"
              :key="item.id"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="signal-row group flex min-w-0 items-center gap-3 py-3.5 outline-none transition-colors"
            >
              <span
                class="signal-icon-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors group-hover:border-[var(--signal-accent)] group-hover:text-[var(--signal-accent)]"
              >
                <Icon :name="item.sourceIcon" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span
                  class="line-clamp-1 text-sm font-medium text-foreground opacity-80 transition-opacity group-hover:opacity-100"
                >
                  {{ item.title }}
                </span>
                <span
                  class="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground opacity-75"
                >
                  <span>{{ item.sourceLabel }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ item.publishedLabel }}</span>
                </span>
              </span>
              <Icon
                name="heroicons:arrow-up-right"
                class="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-50 transition-colors group-hover:text-[var(--signal-accent)] group-hover:opacity-100"
              />
            </a>

            <button
              v-if="hiddenEvidenceCount > 0"
              type="button"
              class="signal-accent flex w-full items-center gap-2 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] opacity-75 outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100"
              @click="showAllEvidence = true"
            >
              <Icon name="heroicons:plus" class="h-3.5 w-3.5" />
              +{{ hiddenEvidenceCount }} {{ moreEvidenceLabel }}
            </button>
          </div>

          <div class="signal-accent flex items-center justify-center py-2 opacity-80 lg:py-0">
            <Icon
              name="ph:git-merge-duotone"
              class="h-14 w-14 rotate-90 lg:h-16 lg:w-16 lg:rotate-0"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            class="signal-thesis group mx-auto flex aspect-square w-full max-w-[15.5rem] flex-col items-center justify-center rounded-full border px-8 text-center outline-none transition-colors hover:border-[var(--signal-accent)] focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)]"
            @click="emit('readTake')"
          >
            <Icon
              name="ph:sparkle-fill"
              class="signal-accent h-5 w-5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 motion-reduce:transition-none"
            />
            <span class="signal-accent mt-4 font-mono text-[10px] uppercase tracking-[0.17em]">
              {{ thesisLabel }}
            </span>
            <span class="mt-3 text-lg font-medium leading-snug text-foreground sm:text-xl">
              {{ thesis }}
            </span>
            <span
              class="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground opacity-70"
            >
              {{ topicLabel }}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  </section>
</template>
