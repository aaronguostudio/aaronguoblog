<script setup lang="ts">
import type { SignalThreadCard } from '~/utils/signal-threads'

defineProps<{
  threads: SignalThreadCard[]
  heading: string
  description: string
  confidenceLabel: string
  activeThesisLabel: string
  supportingSignalsLabel: string
  moreSignalsLabel: string
  questionLabel: string
  productAngleLabel: string
}>()
</script>

<template>
  <section v-if="threads.length > 0" class="py-8">
    <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
          Signal Research
        </p>
        <h2 class="mt-1 text-3xl font-semibold text-foreground">
          {{ heading || "What I'm Watching" }}
        </h2>
        <p class="mt-2 max-w-3xl text-sm text-muted-foreground/70 leading-relaxed">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article
        v-for="(thread, index) in threads"
        :key="thread.slug"
        class="flex min-h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card/75 shadow-sm transition-colors hover:border-cyan-500/40"
      >
        <div class="border-b border-border/45 px-5 py-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <span class="text-[11px] font-mono text-cyan-700 dark:text-cyan-300">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <span
                class="truncate text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45"
              >
                {{ activeThesisLabel }}
              </span>
            </div>
            <span
              class="max-w-[52%] shrink-0 rounded-md bg-secondary px-2 py-1 text-right text-[10px] font-mono uppercase leading-tight tracking-wide text-muted-foreground"
            >
              {{ confidenceLabel }} · {{ thread.confidence }}
            </span>
          </div>

          <h3 class="min-w-0 break-words text-xl font-semibold leading-tight text-foreground">
            {{ thread.title }}
          </h3>
        </div>

        <div class="flex flex-1 flex-col px-5 py-4">
          <p class="text-base leading-relaxed text-foreground/85">
            {{ thread.thesis }}
          </p>

          <p
            class="mt-4 border-l border-cyan-500/35 pl-3 text-sm leading-relaxed text-muted-foreground/75"
          >
            {{ thread.builderImplication }}
          </p>

          <div v-if="thread.matchedSignals.length > 0" class="mt-5">
            <p
              class="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45"
            >
              {{ supportingSignalsLabel }}
            </p>
            <div class="divide-y divide-border/45 border-y border-border/45">
              <a
                v-for="signal in thread.matchedSignals.slice(0, 3)"
                :key="signal.id"
                :href="signal.url"
                target="_blank"
                rel="noopener"
                class="group grid grid-cols-[auto_1fr] gap-3 py-3 transition-colors"
              >
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                <span class="min-w-0">
                  <span
                    class="line-clamp-1 text-sm font-medium leading-snug text-foreground/80 group-hover:text-foreground"
                  >
                    {{ signal.title }}
                  </span>
                  <span class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground/60">
                    {{ signal.note }}
                  </span>
                </span>
              </a>
            </div>
            <p
              v-if="thread.matchedSignals.length > 3"
              class="mt-2 text-[11px] text-muted-foreground/45"
            >
              +{{ thread.matchedSignals.length - 3 }} {{ moreSignalsLabel }}
            </p>
          </div>

          <div
            class="mt-auto grid gap-3 border-t border-border/45 pt-4 sm:grid-cols-2 lg:grid-cols-1"
          >
            <p class="text-xs leading-relaxed text-muted-foreground/70">
              <span
                class="mb-1 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45"
              >
                {{ questionLabel }}
              </span>
              {{ thread.openQuestion }}
            </p>
            <p class="text-xs leading-relaxed text-muted-foreground/70">
              <span
                class="mb-1 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45"
              >
                {{ productAngleLabel }}
              </span>
              {{ thread.productHypothesis }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
