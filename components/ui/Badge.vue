<script setup lang="ts">
interface Props {
  text: string
  pulse?: boolean
  variant?: 'default' | 'muted' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  pulse: false,
  variant: 'default',
})

const variantClasses = {
  default: 'bg-secondary border-border text-foreground',
  muted: 'bg-muted border-border text-muted-foreground',
  outline: 'bg-transparent border-border text-foreground',
}

const dotColorClasses = {
  default: 'bg-foreground',
  muted: 'bg-muted-foreground',
  outline: 'bg-foreground',
}
</script>

<template>
  <div
    :class="[
      'inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg',
      variantClasses[variant],
    ]"
  >
    <div
      v-if="pulse"
      :class="['w-2 h-2 rounded-full', dotColorClasses[variant], pulse ? 'animate-pulse' : '']"
    />
    <span class="text-sm font-medium">
      {{ text }}
    </span>
  </div>
</template>
