<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'

type SignalPulseCard = {
  id: string
  url: string
  title: string
  summary: string
  sourceLabel: string
  sourceIcon: string
  publishedLabel: string
}

defineProps<{
  open: boolean
  pulseText: string | null
  pulseDate: string | null
  heading: string
  description: string
  machineLabel: string
  evidenceLabel: string
  closeLabel: string
  fullEvidenceLabel: string
  pulseCards: SignalPulseCard[]
}>()

const emit = defineEmits<{
  close: []
  openWorkbench: []
}>()

const prefersReducedMotion = useReducedMotion()
</script>

<template>
  <motion.section
    v-if="open"
    id="signal-evidence"
    class="signal-rule scroll-mt-28 border-b py-12 lg:py-16"
    :initial="prefersReducedMotion ? false : { opacity: 0, y: 24 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }"
  >
    <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="signal-accent font-mono text-[10px] uppercase tracking-[0.18em]">
          {{ evidenceLabel }}
        </p>
        <h2 class="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
          {{ heading }}
        </h2>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {{ description }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 self-start rounded-lg px-2 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)] sm:self-auto"
        @click="emit('close')"
      >
        {{ closeLabel }}
        <Icon name="heroicons:x-mark" class="h-4 w-4" />
      </button>
    </div>

    <div class="mt-8 grid gap-10 lg:grid-cols-[minmax(16rem,0.42fr)_minmax(0,1fr)]">
      <aside class="signal-accent-rule border-l pl-5">
        <div
          class="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground opacity-75"
        >
          <span>{{ machineLabel }}</span>
          <span v-if="pulseDate" aria-hidden="true">·</span>
          <span v-if="pulseDate">{{ pulseDate }}</span>
        </div>
        <p class="mt-4 text-base leading-7 text-foreground opacity-75">
          {{ pulseText }}
        </p>
      </aside>

      <div class="signal-divide signal-rule divide-y border-y">
        <a
          v-for="item in pulseCards"
          :key="item.id"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="signal-row group grid gap-3 py-4 outline-none transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start"
        >
          <span
            class="signal-icon-surface flex h-9 w-9 items-center justify-center rounded-full border transition-colors group-hover:border-[var(--signal-accent)] group-hover:text-[var(--signal-accent)]"
          >
            <Icon :name="item.sourceIcon" class="h-4 w-4" />
          </span>
          <span class="min-w-0">
            <span
              class="text-sm font-semibold leading-snug text-foreground opacity-80 transition-opacity group-hover:opacity-100 sm:text-base"
            >
              {{ item.title }}
            </span>
            <span
              v-if="item.summary"
              class="mt-1.5 line-clamp-2 block text-sm leading-6 text-muted-foreground"
            >
              {{ item.summary }}
            </span>
          </span>
          <span
            class="flex items-center gap-2 font-mono text-[10px] text-muted-foreground opacity-75 sm:pt-1"
          >
            <span>{{ item.sourceLabel }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ item.publishedLabel }}</span>
            <Icon name="heroicons:arrow-up-right" class="h-3.5 w-3.5" />
          </span>
        </a>
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <button
        type="button"
        class="signal-accent group inline-flex items-center gap-3 text-sm font-medium outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[var(--signal-accent)]"
        @click="emit('openWorkbench')"
      >
        {{ fullEvidenceLabel }}
        <Icon
          name="heroicons:arrow-right"
          class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </button>
    </div>
  </motion.section>
</template>
