<script setup lang="ts">
const props = defineProps({
  href: {
    type: String,
    default: '',
  },
})

const isDownload = computed(() => {
  return /\.(xlsx|xls|csv|pdf|docx|doc|pptx|ppt|zip|tar|gz|md)$/i.test(props.href)
})
</script>

<template>
  <a v-if="isDownload" :href="href" download><slot /></a>
  <NuxtLink v-else :to="href"><slot /></NuxtLink>
</template>
