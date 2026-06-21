<script setup lang="ts">
type SignalPulseCard = {
  id: string
  url: string
  title: string
  sourceLabel: string
  categoryLabel: string
  sourceClass: string
  categoryClass: string
}

defineProps<{
  pulseText: string | null
  pulseDate: string | null
  dailyReadoutLabel: string
  heading: string
  description: string
  evidenceLabel: string
  pulseCards: SignalPulseCard[]
}>()
</script>

<template>
  <section v-if="pulseText" class="py-8">
    <div class="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div class="border-l border-cyan-500/40 pl-4">
        <p class="text-[11px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
          {{ dailyReadoutLabel }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          {{ heading }}
        </h2>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground/70">
          {{ description }}
        </p>
        <p v-if="pulseDate" class="mt-4 text-[11px] font-mono text-muted-foreground/45">
          {{ pulseDate }}
        </p>
      </div>

      <article class="rounded-lg border border-border/70 bg-card/75 p-4 sm:p-5">
        <p class="text-base leading-relaxed text-foreground sm:text-lg">
          {{ pulseText }}
        </p>

        <div v-if="pulseCards.length > 0" class="mt-5 border-t border-border/50 pt-4">
          <p class="mb-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {{ evidenceLabel }}
          </p>
          <div class="divide-y divide-border/45">
            <a
              v-for="item in pulseCards"
              :key="item.id"
              :href="item.url"
              target="_blank"
              rel="noopener"
              class="group grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <span class="flex min-w-0 items-center gap-2.5">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="item.sourceClass" />
                <span
                  class="line-clamp-2 text-sm font-medium leading-snug text-foreground/75 group-hover:text-foreground"
                >
                  {{ item.title }}
                </span>
              </span>
              <span class="flex items-center gap-2 sm:justify-end">
                <span class="text-[10px] font-mono text-muted-foreground/45">
                  {{ item.sourceLabel }}
                </span>
                <span
                  class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  :class="item.categoryClass"
                >
                  {{ item.categoryLabel }}
                </span>
              </span>
            </a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
