<script setup lang="ts">
const props = defineProps<{
  videoId: string
  title?: string
}>()

const embedUrl = computed(() => `https://www.youtube-nocookie.com/embed/${props.videoId}`)
</script>

<template>
  <div class="my-8 not-prose">
    <div class="aspect-video rounded-xl overflow-hidden border border-border">
      <iframe
        :src="embedUrl"
        :title="title || 'YouTube video'"
        class="w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
    <p v-if="title" class="mt-2 text-sm text-muted-foreground text-center">
      {{ title }}
    </p>
  </div>
</template>
