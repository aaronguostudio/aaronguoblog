<script setup lang="ts">
interface Props {
  variant?: 'default' | 'gradient' | 'accent'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: true,
})

const variantClasses = {
  default: 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800',
  gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800',
  accent: 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800',
}
</script>

<template>
  <div 
    :class="[
      'relative rounded-2xl p-6 shadow-lg transition-all duration-300',
      variantClasses[variant],
      hover ? 'hover:shadow-xl hover:scale-105' : '',
    ]"
  >
    <!-- Decorative corner accent for accent variant -->
    <div v-if="variant === 'accent'" class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full rounded-tr-2xl" />
    
    <div :class="variant === 'accent' ? 'relative' : ''">
      <slot />
    </div>
  </div>
</template>

