<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  href?: string
  to?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  icon: undefined,
  href: undefined,
  to: undefined,
  iconPosition: 'left',
})

const variantClasses = {
  primary: 'text-primary-foreground bg-primary hover:bg-foreground shadow-lg hover:shadow-xl',
  secondary:
    'text-foreground bg-secondary hover:bg-muted border-2 border-border hover:border-foreground/20',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-secondary',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const baseClasses =
  'group inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 hover:scale-105'
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
