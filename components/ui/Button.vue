<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  href?: string
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconPosition: 'left',
})

const variantClasses = {
  primary: 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
  secondary: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600',
  ghost: 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const baseClasses = 'group inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 hover:scale-105'
</script>

<template>
  <component
    :is="href ? 'a' : to ? 'NuxtLink' : 'button'"
    :href="href"
    :to="to"
    :class="[baseClasses, variantClasses[variant], sizeClasses[size]]"
  >
    <Icon 
      v-if="icon && iconPosition === 'left'" 
      :name="icon" 
      class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" 
    />
    <span class="relative z-10">
      <slot />
    </span>
    <Icon 
      v-if="icon && iconPosition === 'right'" 
      :name="icon" 
      class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
    />
  </component>
</template>

