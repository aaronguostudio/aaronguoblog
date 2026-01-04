<script setup lang="ts">
import { makeFirstCharUpper } from '@/utils/helper'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Props for the component
interface Props {
  allTags: Map<string, number>
  selectedCategories: string[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:selectedCategories'])

// some random color for tags
const colors = [
  '#dc2626',
  '#d97706',
  '#65a30d',
  '#059669',
  '#0891b2',
  '#0284c7',
  '#4f46e5',
  '#7c3aed',
  '#c026d3',
  '#db2777',
]

// Get a random color for each category
const categoryColors = ref(new Map())

// Initialize colors for categories
onMounted(() => {
  props.allTags.forEach((count, tag) => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    categoryColors.value.set(tag, colors[randomIndex])
  })
})

// Toggle category selection
const toggleCategory = (category: string) => {
  const currentSelected = [...props.selectedCategories]
  const index = currentSelected.indexOf(category)

  if (index === -1) {
    // Add category if not already selected
    currentSelected.push(category)
  } else {
    // Remove category if already selected
    currentSelected.splice(index, 1)
  }

  emit('update:selectedCategories', currentSelected)

  // Update URL query parameters
  updateQueryParams(currentSelected)
}

// Update URL query parameters without reloading the page
const updateQueryParams = (categories: string[]) => {
  const query = { ...route.query }

  if (categories.length > 0) {
    query.categories = categories.join(',')
  } else {
    delete query.categories
  }

  router.push({ query })
}

// Check if a category is selected
const isCategorySelected = (category: string) => {
  return props.selectedCategories.includes(category)
}

// Get color for a category
const getCategoryColor = (category: string) => {
  return categoryColors.value.get(category) || colors[0]
}

// Computed properties for translations
const categoriesTitle = computed(() => t('categories.title'))
const filterDescription = computed(() => t('categories.filterDescription'))
const selectedText = computed(() => t('categories.selected'))
const clearAllText = computed(() => t('categories.clearAll'))

// Method to clear all selected categories
const clearAllCategories = () => {
  emit('update:selectedCategories', [])
  updateQueryParams([])
}
</script>

<template>
  <div>
    <div class="relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <!-- Decorative corner accent -->
      <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full rounded-tr-2xl" />

      <div class="relative">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 class="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
            {{ categoriesTitle }}
          </h2>
        </div>
        <p class="text-sm mb-6 text-zinc-600 dark:text-zinc-400 ml-4">
          {{ filterDescription }}
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="[category, count] in props.allTags"
            :key="category"
            :style="{
              backgroundColor: isCategorySelected(category)
                ? getCategoryColor(category)
                : 'transparent',
              borderColor: getCategoryColor(category),
            }"
            class="group relative px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-300 border-2 text-sm font-semibold overflow-hidden hover:scale-105 hover:shadow-md"
            :class="{
              'text-white shadow-lg': isCategorySelected(category),
              'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50':
                !isCategorySelected(category),
            }"
            @click="toggleCategory(category)"
          >
            <!-- Shimmer effect on hover -->
            <div
              v-if="!isCategorySelected(category)"
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            />

            <span class="relative flex items-center gap-1.5">
              {{ makeFirstCharUpper(category) }}
              <span
                class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold"
                :class="isCategorySelected(category) ? 'bg-white/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'"
              >
                {{ count }}
              </span>
            </span>
          </button>
        </div>

        <div
          v-if="props.selectedCategories.length > 0"
          class="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center"
        >
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
              {{ props.selectedCategories.length }} {{ selectedText }}
            </span>
          </div>
          <button
            class="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            @click="clearAllCategories"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>{{ clearAllText }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
