<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  selectedTopics: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedTopics': [topics: string[]]
}>()

// Define available topics
const availableTopics = [
  { id: 'ai-native', label: 'AI Native', icon: '🤖' },
  { id: 'execution', label: 'Execution', icon: '⚡' },
  { id: 'leadership', label: 'Leadership', icon: '🎯' },
]

function toggleTopic(topicId: string) {
  const currentTopics = [...props.selectedTopics]
  const index = currentTopics.indexOf(topicId)

  if (index > -1) {
    // Remove topic if already selected
    currentTopics.splice(index, 1)
  } else {
    // Add topic if not selected
    currentTopics.push(topicId)
  }

  emit('update:selectedTopics', currentTopics)
}

function clearAll() {
  emit('update:selectedTopics', [])
}

function isSelected(topicId: string) {
  return props.selectedTopics.includes(topicId)
}
</script>

<template>
  <div class="mb-8">
    <!-- Header with gradient accent -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        <h3 class="text-xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
          {{ t('blogs.filterByTopic') }}
        </h3>
      </div>
      <button
        v-if="selectedTopics.length > 0"
        class="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        @click="clearAll"
      >
        <Icon name="heroicons:x-mark" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        <span>{{ t('categories.clearAll') }}</span>
      </button>
    </div>

    <!-- Topic Pills with Modern Design -->
    <div class="flex flex-wrap gap-3">
      <button
        v-for="topic in availableTopics"
        :key="topic.id"
        :class="[
          'group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden',
          isSelected(topic.id)
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-105'
            : 'bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:scale-105',
        ]"
        @click="toggleTopic(topic.id)"
      >
        <!-- Animated background gradient on hover -->
        <div
          v-if="!isSelected(topic.id)"
          class="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        <!-- Icon with animation -->
        <span
          :class="[
            'text-lg transition-transform duration-300 relative z-10',
            isSelected(topic.id) ? 'scale-110' : 'group-hover:scale-110'
          ]"
        >
          {{ topic.icon }}
        </span>

        <!-- Label -->
        <span class="relative z-10">{{ topic.label }}</span>

        <!-- Checkmark for selected state -->
        <Icon
          v-if="isSelected(topic.id)"
          name="heroicons:check-circle-solid"
          class="w-4 h-4 relative z-10 animate-in fade-in zoom-in duration-300"
        />
      </button>
    </div>

    <!-- Selection Counter with Badge -->
    <div v-if="selectedTopics.length > 0" class="mt-4 flex items-center gap-2">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
          {{ selectedTopics.length }} {{ t('categories.selected') }}
        </span>
      </div>
    </div>
  </div>
</template>

