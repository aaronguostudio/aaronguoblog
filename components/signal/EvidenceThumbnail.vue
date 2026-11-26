<script setup lang="ts">
import type { VNode } from 'vue'

defineProps<{ image?: string }>()

const loadedImage = ref<HTMLImageElement | null>(null)
const imageElement = ref<HTMLImageElement | null>(null)
const showImage = computed(() => imageElement.value !== null && loadedImage.value === imageElement.value)

// Cached or broken images can finish before Vue hydrates the row.
function checkImage(vnode: VNode) {
  const image = vnode.el as HTMLImageElement
  if (image.complete && image.naturalWidth > 0) loadedImage.value = image
}

function onLoad(event: Event) {
  loadedImage.value = event.currentTarget as HTMLImageElement
}
</script>

<template>
  <span
    aria-hidden="true"
    class="relative grid place-items-center"
    :class="image ? 'h-16 w-16' : 'h-4 w-4'"
  >
    <Icon
      v-if="!showImage"
      name="heroicons:arrow-up-right"
      class="h-4 w-4 text-muted-foreground opacity-50 transition-colors group-hover:text-[var(--signal-accent)] group-hover:opacity-100"
    />
    <img
      v-if="image"
      :key="image"
      ref="imageElement"
      :src="image"
      :class="{ invisible: !showImage }"
      class="absolute inset-0 h-16 w-16 rounded object-cover"
      alt=""
      width="64"
      height="64"
      loading="lazy"
      referrerpolicy="no-referrer"
      @vue:mounted="checkImage"
      @load="onLoad"
      @error="loadedImage = null"
    />
  </span>
</template>
