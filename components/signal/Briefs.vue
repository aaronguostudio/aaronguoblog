<script setup lang="ts">
import type { SignalBriefCard } from '~/utils/signal-briefs'

const props = defineProps<{
  briefs: SignalBriefCard[]
  heading: string
  description: string
  latestLabel: string
  relatedThreadLabel: string
  weeklyBriefLabel: string
  funnelLabel: string
  signalsLabel: string
  threadsLabel: string
  briefLabel: string
  hypothesisLabel: string
  signalsDistilledLabel: string
}>()

const funnelStages = computed(() => [
  { key: 'signals', label: props.signalsLabel },
  { key: 'threads', label: props.threadsLabel },
  { key: 'brief', label: props.briefLabel },
  { key: 'hypothesis', label: props.hypothesisLabel },
])
</script>

<template>
  <section v-if="briefs.length > 0" class="py-8">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
          Signal Briefs
        </p>
        <h2 class="mt-1 text-2xl font-semibold text-foreground">
          {{ heading }}
        </h2>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground/70 leading-relaxed">
          {{ description }}
        </p>
      </div>
    </div>

    <article
      v-for="brief in briefs"
      :key="brief.slug"
      class="rounded-lg border border-border/70 bg-card/80 p-5 shadow-sm sm:p-6"
    >
      <div
        class="flex flex-col gap-4 border-b border-border/40 pb-5 lg:flex-row lg:items-start lg:justify-between"
      >
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span
              class="rounded-md bg-cyan-500/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-cyan-700 dark:text-cyan-300"
            >
              {{ latestLabel }}
            </span>
            <span class="text-[11px] font-mono uppercase text-muted-foreground/55">
              {{ weeklyBriefLabel }}
            </span>
            <span class="text-[11px] font-mono text-muted-foreground/45">
              {{ brief.periodLabel }} · {{ brief.readTime }}
            </span>
            <span class="text-[11px] font-mono text-muted-foreground/45">
              {{ brief.signalCount }} {{ signalsDistilledLabel }}
            </span>
          </div>
          <h3 class="text-xl font-semibold leading-snug text-foreground">
            {{ brief.title }}
          </h3>
          <p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground/75">
            {{ brief.description }}
          </p>
        </div>

        <div class="min-w-0 lg:w-80">
          <p class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45">
            {{ funnelLabel }}
          </p>
          <ol class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4 lg:grid-cols-2">
            <li
              v-for="stage in funnelStages"
              :key="stage.key"
              class="flex min-w-0 items-center gap-2 text-[11px] font-mono"
              :class="
                stage.key === brief.funnelStage ? 'text-foreground' : 'text-muted-foreground/45'
              "
            >
              <span
                class="h-2 w-2 shrink-0 rounded-full border"
                :class="
                  stage.key === brief.funnelStage
                    ? 'border-cyan-500 bg-cyan-500'
                    : 'border-border bg-background'
                "
              />
              <span class="truncate">{{ stage.label }}</span>
            </li>
          </ol>
          <p class="mt-4 truncate text-[10px] font-mono text-muted-foreground/45">
            {{ relatedThreadLabel }}: {{ brief.threadSlug }}
          </p>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section
          v-for="(section, index) in brief.sections"
          :key="section.heading"
          class="min-w-0 border-t border-border/45 pt-5"
          :class="index < 2 ? 'lg:col-span-1' : ''"
        >
          <h4 class="text-base font-semibold leading-snug text-foreground">
            {{ section.heading }}
          </h4>
          <div class="mt-3 space-y-3">
            <p
              v-for="paragraph in section.body"
              :key="paragraph"
              class="text-sm leading-relaxed text-muted-foreground/75"
            >
              {{ paragraph }}
            </p>
          </div>
          <ul v-if="section.bullets.length > 0" class="mt-3 space-y-1.5">
            <li
              v-for="bullet in section.bullets"
              :key="bullet"
              class="flex gap-2 text-sm leading-relaxed text-muted-foreground/75"
            >
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
              <span>{{ bullet }}</span>
            </li>
          </ul>
        </section>
      </div>
    </article>
  </section>
</template>
