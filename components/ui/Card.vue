<script setup lang="ts">
interface Props {
  variant?: 'default' | 'gradient' | 'accent'
  hover?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: true,
})

const variantClasses = {
  default: 'bg-card border-2 border-border',
  gradient: 'bg-secondary border-2 border-border',
  accent: 'bg-card border-2 border-border',
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
    <div
      v-if="variant === 'accent'"
      class="absolute top-0 right-0 w-20 h-20 bg-foreground/5 rounded-bl-full rounded-tr-2xl"
    />

    <div :class="variant === 'accent' ? 'relative' : ''">
      <slot />
    </div>
  </div>
</template>
