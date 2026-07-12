<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'
import type { SignalBriefCard } from '~/utils/signal-briefs'

defineProps<{
  briefs: SignalBriefCard[]
  heading: string
  description: string
  latestLabel: string
  weeklyBriefLabel: string
  signalsDistilledLabel: string
  openLabel: string
  closeLabel: string
}>()

const openSlug = ref('')
const prefersReducedMotion = useReducedMotion()

function toggleBrief(slug: string) {
  openSlug.value = openSlug.value === slug ? '' : slug
}
</script>

<template>
  <section v-if="briefs.length > 0" class="signal-rule border-b py-12 lg:py-16">
    <div class="mb-7">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground opacity-70">
        Archive
      </p>
      <h2 class="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
        {{ heading }}
      </h2>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {{ description }}
      </p>
    </div>

    <div class="signal-rule border-y">
      <article v-for="brief in briefs" :key="brief.slug">
        <button
          type="button"
          class="signal-row group grid w-full gap-4 px-5 py-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--signal-accent)] sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:gap-6 sm:px-6 sm:py-6"
          :aria-expanded="openSlug === brief.slug"
          :aria-controls="`signal-brief-${brief.slug}`"
          :aria-label="`${openSlug === brief.slug ? closeLabel : openLabel}: ${brief.title}`"
          @click="toggleBrief(brief.slug)"
        >
          <span
            class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground opacity-75"
          >
            {{ brief.periodLabel }}
          </span>
          <span class="min-w-0">
            <span
              class="block text-base font-medium leading-snug text-foreground opacity-80 transition-opacity group-hover:opacity-100"
            >
              {{ brief.title }}
            </span>
            <span
              class="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground opacity-70"
            >
              <span>{{ latestLabel }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ weeklyBriefLabel }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ brief.signalCount }} {{ signalsDistilledLabel }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ brief.readTime }}</span>
            </span>
          </span>
          <span class="signal-disclosure flex h-9 w-9 items-center justify-center rounded-md border" aria-hidden="true">
            <Icon
              name="heroicons:chevron-down"
              class="h-4 w-4 transition-transform duration-300 motion-reduce:transition-none"
              :class="openSlug === brief.slug ? 'signal-accent rotate-180' : ''"
            />
          </span>
        </button>

        <motion.div
          v-if="openSlug === brief.slug"
          :id="`signal-brief-${brief.slug}`"
          class="signal-rule border-t px-5 pb-9 pt-7 sm:pr-6 sm:pl-[11.25rem]"
          :initial="prefersReducedMotion ? false : { opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }"
        >
          <p class="max-w-3xl text-base leading-7 text-foreground opacity-75">
            {{ brief.description }}
          </p>

          <div class="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-2">
            <section
              v-for="section in brief.sections"
              :key="section.heading"
              class="signal-rule border-l pl-5"
            >
              <h3 class="text-base font-semibold text-foreground">
                {{ section.heading }}
              </h3>
              <div class="mt-3 space-y-3">
                <p
                  v-for="paragraph in section.body"
                  :key="paragraph"
                  class="text-sm leading-6 text-muted-foreground"
                >
                  {{ paragraph }}
                </p>
              </div>
              <ul v-if="section.bullets.length > 0" class="mt-4 space-y-2">
                <li
                  v-for="bullet in section.bullets"
                  :key="bullet"
                  class="flex gap-2 text-sm leading-6 text-muted-foreground"
                >
                  <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--signal-accent)]" />
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </section>
          </div>
        </motion.div>
      </article>
    </div>
  </section>
</template>
