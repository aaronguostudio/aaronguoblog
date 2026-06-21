<script setup lang="ts">
import type { SignalThreadCard } from '~/utils/signal-threads'

defineProps<{
  threads: SignalThreadCard[]
  heading: string
  description: string
  confidenceLabel: string
  supportingSignalsLabel: string
  moreSignalsLabel: string
  openQuestionLabel: string
  productHypothesisLabel: string
}>()
</script>

<template>
  <section v-if="threads.length > 0" class="mb-8">
    <div class="mb-4">
      <p class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
        Signal Research
      </p>
      <h2 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {{ heading || "What I'm Watching" }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-muted-foreground/70 leading-relaxed">
        {{ description }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article
        v-for="thread in threads"
        :key="thread.slug"
        class="rounded-lg border border-border/60 bg-card/70 p-4 transition-colors hover:border-cyan-500/30"
      >
        <div class="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <h3 class="min-w-0 flex-1 break-words text-base font-semibold leading-snug text-foreground">
            {{ thread.title }}
          </h3>
          <span
            class="max-w-full shrink-0 whitespace-normal rounded-md bg-secondary px-2 py-1 text-right text-[10px] font-mono uppercase leading-tight tracking-wide text-muted-foreground"
          >
            {{ confidenceLabel }}: {{ thread.confidence }}
          </span>
        </div>

        <p class="mt-2 text-sm text-muted-foreground/75 leading-relaxed">
          {{ thread.thesis }}
        </p>

        <p class="mt-3 text-xs text-foreground/80 leading-relaxed">
          {{ thread.builderImplication }}
        </p>

        <div v-if="thread.matchedSignals.length > 0" class="mt-4">
          <p class="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45">
            {{ supportingSignalsLabel }}
          </p>
          <div class="flex flex-col gap-2">
            <a
              v-for="signal in thread.matchedSignals.slice(0, 3)"
              :key="signal.id"
              :href="signal.url"
              target="_blank"
              rel="noopener"
              class="group rounded-md border border-border/40 px-3 py-2 hover:bg-secondary/60"
            >
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                <span
                  class="line-clamp-1 text-xs font-medium text-foreground/80 group-hover:text-foreground"
                >
                  {{ signal.title }}
                </span>
              </div>
              <p class="mt-1 line-clamp-2 text-[11px] text-muted-foreground/55">
                {{ signal.note }}
              </p>
            </a>
          </div>
          <p
            v-if="thread.matchedSignals.length > 3"
            class="mt-2 text-[11px] text-muted-foreground/45"
          >
            +{{ thread.matchedSignals.length - 3 }} {{ moreSignalsLabel }}
          </p>
        </div>

        <div class="mt-4 space-y-2 border-t border-border/40 pt-3">
          <p class="text-[11px] text-muted-foreground/70">
            <span class="font-semibold text-foreground/70">{{ openQuestionLabel }}:</span>
            {{ thread.openQuestion }}
          </p>
          <p class="text-[11px] text-muted-foreground/70">
            <span class="font-semibold text-foreground/70">{{ productHypothesisLabel }}:</span>
            {{ thread.productHypothesis }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
