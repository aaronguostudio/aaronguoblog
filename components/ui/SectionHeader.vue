<script setup lang="ts">
interface Props {
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

const barHeightClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12',
}
</script>

<template>
  <div class="flex items-center gap-3 mb-6">
    <div :class="['w-1 bg-foreground rounded-full', barHeightClasses[size]]" />
    <h2 :class="['font-bold text-foreground', sizeClasses[size]]">
      {{ title }}
    </h2>
  </div>
</template>
