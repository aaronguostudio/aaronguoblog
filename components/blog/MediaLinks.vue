<script setup lang="ts">
defineProps<{
  youtube?: string
  audio?: string
}>()
</script>

<template>
  <div v-if="youtube || audio" class="flex flex-col items-end gap-2 mt-4">
    <a
      v-if="youtube"
      :href="youtube"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-3 py-2 rounded-md border dark:border-gray-800 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors duration-200 text-sm font-medium"
    >
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      Watch on YouTube
    </a>
    <a
      v-if="audio"
      :href="audio"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-3 py-2 rounded-md border dark:border-gray-800 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors duration-200 text-sm font-medium"
    >
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
      Listen to Audio
    </a>
  </div>
</template>
