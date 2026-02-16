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
  { id: 'building-in-public', label: 'Building in Public', icon: '🚀' },
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
        <div class="w-1 h-8 bg-foreground rounded-full" />
        <h3 class="text-xl font-bold text-foreground">
          {{ t('blogs.filterByTopic') }}
        </h3>
      </div>
      <button
        v-if="selectedTopics.length > 0"
        class="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        @click="clearAll"
      >
        <Icon
          name="heroicons:x-mark"
          class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
        />
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
            ? 'bg-primary text-primary-foreground shadow-lg scale-105'
            : 'bg-card text-foreground border border-border hover:border-foreground/20 hover:shadow-md hover:scale-105',
        ]"
        @click="toggleTopic(topic.id)"
      >
        <!-- Animated background gradient on hover -->
        <div
          v-if="!isSelected(topic.id)"
          class="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        <!-- Icon with animation -->
        <span
          :class="[
            'text-lg transition-transform duration-300 relative z-10',
            isSelected(topic.id) ? 'scale-110' : 'group-hover:scale-110',
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
      <div
        class="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg"
      >
        <div class="w-2 h-2 bg-foreground rounded-full animate-pulse" />
        <span class="text-sm font-medium text-foreground">
          {{ selectedTopics.length }} {{ t('categories.selected') }}
        </span>
      </div>
    </div>
  </div>
</template>
