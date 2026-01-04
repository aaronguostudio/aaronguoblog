<script setup lang="ts">
interface Props {
  text: string
  pulse?: boolean
  variant?: 'blue' | 'purple' | 'pink' | 'gradient'
}

const props = withDefaults(defineProps<Props>(), {
  pulse: false,
  variant: 'blue',
})

const variantClasses = {
  blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  pink: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300',
  gradient: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
}

const dotColorClasses = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gradient: 'bg-blue-500',
}
</script>

<template>
  <div :class="['inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg', variantClasses[variant]]">
    <div 
      v-if="pulse" 
      :class="['w-2 h-2 rounded-full', dotColorClasses[variant], pulse ? 'animate-pulse' : '']" 
    />
    <span class="text-sm font-medium">
      {{ text }}
    </span>
  </div>
</template>

