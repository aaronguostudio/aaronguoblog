<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: string
}

defineProps<Props>()
</script>

<template>
  <div class="mb-12">
    <div class="relative">
      <!-- Decorative subtle background -->
      <div
        class="absolute inset-0 bg-foreground/[0.02] dark:bg-foreground/[0.03] rounded-3xl blur-3xl"
      />

      <div
        class="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl"
      >
        <div v-if="icon" class="flex items-center gap-4 mb-4">
          <span class="text-5xl">{{ icon }}</span>
          <h1 class="text-4xl md:text-5xl font-bold text-foreground">
            {{ title }}
          </h1>
        </div>
        <h1 v-else class="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          {{ title }}
        </h1>
        <p v-if="description" class="text-lg text-muted-foreground max-w-2xl">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>
