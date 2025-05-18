<script setup lang="ts">
// Define only the required props, handle class through attrs
defineProps<{
  href: string
  target?: string
}>()

// Disable attribute inheritance to handle class manually
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <a :href="href" :target="target" v-bind="$attrs">
    <slot />
  </a>
</template>
