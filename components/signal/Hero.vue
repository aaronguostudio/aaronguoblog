<script setup lang="ts">
type SignalHeroMetric = {
  label: string
  value: string
  caption: string
}

type SignalHeroSourceRow = {
  source: string
  label: string
  count: string
  percent: number
  colorClass: string
}

defineProps<{
  title: string
  eyebrow: string
  description: string
  statusLabel: string
  liveLabel: string
  operationsLabel: string
  sourceMixLabel: string
  pulseDateLabel: string
  pulseDate?: string | null
  promises: string[]
  metrics: SignalHeroMetric[]
  sourceMixRows: SignalHeroSourceRow[]
}>()
</script>

<template>
  <section class="relative overflow-hidden border-b border-border/60 py-8 sm:py-12 lg:py-14">
    <div
      class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
    />

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:items-start">
      <div class="min-w-0">
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <span
            class="rounded-md border border-border/70 bg-background px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
          >
            {{ eyebrow }}
          </span>
          <span
            class="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-300"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
              />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {{ liveLabel }}
          </span>
        </div>

        <h1
          class="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          {{ title }}
        </h1>

        <p class="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {{ description }}
        </p>

        <div class="mt-7 grid gap-3 sm:grid-cols-3">
          <div
            v-for="promise in promises"
            :key="promise"
            class="border-l border-border/80 pl-3 text-sm leading-relaxed text-muted-foreground/80"
          >
            {{ promise }}
          </div>
        </div>
      </div>

      <aside class="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
        <div class="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <p class="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/55">
              {{ operationsLabel }}
            </p>
            <p class="mt-1 text-sm font-medium text-foreground">
              {{ statusLabel }}
            </p>
          </div>
          <div v-if="pulseDate" class="text-right">
            <p class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/45">
              {{ pulseDateLabel }}
            </p>
            <p class="mt-1 text-xs font-mono text-muted-foreground">
              {{ pulseDate }}
            </p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-3">
          <div v-for="metric in metrics" :key="metric.label" class="min-w-0">
            <p class="text-2xl font-semibold tracking-tight text-foreground">
              {{ metric.value }}
            </p>
            <p class="mt-1 text-[10px] font-mono uppercase tracking-wide text-muted-foreground/50">
              {{ metric.label }}
            </p>
            <p class="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground/55">
              {{ metric.caption }}
            </p>
          </div>
        </div>

        <div v-if="sourceMixRows.length > 0" class="mt-5 border-t border-border/50 pt-4">
          <p class="mb-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/55">
            {{ sourceMixLabel }}
          </p>
          <div class="space-y-2">
            <div
              v-for="row in sourceMixRows"
              :key="row.source"
              class="grid grid-cols-[2.5rem_1fr_4.5rem] items-center gap-2"
            >
              <span class="text-right text-[11px] font-mono text-muted-foreground/65">
                {{ row.count }}
              </span>
              <div class="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  class="h-full rounded-full"
                  :class="row.colorClass"
                  :style="{ width: `${row.percent}%` }"
                />
              </div>
              <span class="truncate text-[11px] font-mono text-muted-foreground/65">
                {{ row.label }}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
