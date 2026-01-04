<script setup lang="ts">
interface Props {
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
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
    <div :class="['w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full', barHeightClasses[size]]" />
    <h2 :class="['font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent', sizeClasses[size]]">
      {{ title }}
    </h2>
  </div>
</template>

