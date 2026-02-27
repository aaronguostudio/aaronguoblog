<script setup lang="ts">
defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <pre v-if="language"><slot /></pre>
  <code v-else><slot /></code>
</template>

<style>
pre code .line {
  display: block;
  min-height: 1rem;
}
</style>
