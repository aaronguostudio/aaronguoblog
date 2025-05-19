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
  <div class="sticky">
    <div class="border dark:border-gray-800 p-4 rounded-md dark:bg-slate-900">
      <h2 class="text-xl font-bold mb-4">{{ categoriesTitle }}</h2>
      <p class="text-sm mb-4 text-muted-foreground">{{ filterDescription }}</p>

      <div class="flex flex-wrap gap-2">
        <div
          v-for="[category, count] in props.allTags"
          :key="category"
          :style="{
            backgroundColor: isCategorySelected(category)
              ? getCategoryColor(category)
              : 'transparent',
            borderColor: getCategoryColor(category),
          }"
          class="px-3 py-1.5 rounded cursor-pointer transition-all duration-300 border-2 text-sm font-medium"
          :class="{
            'text-white': isCategorySelected(category),
            'hover:bg-opacity-20 hover:bg-slate-200 dark:hover:bg-slate-800':
              !isCategorySelected(category),
          }"
          @click="toggleCategory(category)"
        >
          {{ makeFirstCharUpper(category) }} ({{ count }})
        </div>
      </div>

      <div
        v-if="props.selectedCategories.length > 0"
        class="mt-4 flex justify-between items-center"
      >
        <div class="text-sm">{{ props.selectedCategories.length }} {{ selectedText }}</div>
        <button class="text-sm text-primary hover:underline" @click="clearAllCategories">
          {{ clearAllText }}
        </button>
      </div>
    </div>
  </div>
</template>
