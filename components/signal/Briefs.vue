<script setup lang="ts">
import type { SignalBriefCard } from '~/utils/signal-briefs'

defineProps<{
  briefs: SignalBriefCard[]
  heading: string
  description: string
  latestLabel: string
  relatedThreadLabel: string
}>()
</script>

<template>
  <section v-if="briefs.length > 0" class="mb-8">
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
          Signal Briefs
        </p>
        <h2 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">
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
      class="rounded-lg border border-border/60 bg-card/70 p-4 sm:p-5"
    >
      <div
        class="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="min-w-0">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span
              class="rounded-md bg-cyan-500/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-cyan-700 dark:text-cyan-300"
            >
              {{ latestLabel }}
            </span>
            <span class="text-[11px] font-mono text-muted-foreground/45">
              {{ brief.date }} · {{ brief.readTime }}
            </span>
          </div>
          <h3 class="text-xl font-semibold leading-snug text-foreground">
            {{ brief.title }}
          </h3>
          <p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground/75">
            {{ brief.description }}
          </p>
        </div>

        <span
          class="shrink-0 rounded-md border border-border/50 px-2 py-1 text-[10px] font-mono text-muted-foreground/60"
        >
          {{ relatedThreadLabel }}: {{ brief.threadSlug }}
        </span>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section
          v-for="(section, index) in brief.sections"
          :key="section.heading"
          class="min-w-0"
          :class="index < 2 ? 'lg:col-span-2' : 'lg:col-span-1'"
        >
          <h4 class="text-sm font-semibold leading-snug text-foreground">
            {{ section.heading }}
          </h4>
          <div class="mt-2 space-y-2">
            <p
              v-for="paragraph in section.body"
              :key="paragraph"
              class="text-xs leading-relaxed text-muted-foreground/70"
            >
              {{ paragraph }}
            </p>
          </div>
          <ul v-if="section.bullets.length > 0" class="mt-2 space-y-1">
            <li
              v-for="bullet in section.bullets"
              :key="bullet"
              class="flex gap-2 text-xs leading-relaxed text-muted-foreground/70"
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
