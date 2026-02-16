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

// Neutral zinc tones for tag borders
const colors = [
  '#71717a', // zinc-500
  '#52525b', // zinc-600
  '#3f3f46', // zinc-700
  '#a1a1aa', // zinc-400
  '#d4d4d8', // zinc-300
]

// Get a consistent color for each category
const categoryColors = ref(new Map())

// Initialize colors for categories
onMounted(() => {
  let i = 0
  props.allTags.forEach((count, tag) => {
    categoryColors.value.set(tag, colors[i % colors.length])
    i++
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
    <div
      class="relative bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <!-- Decorative corner accent -->
      <div
        class="absolute top-0 right-0 w-20 h-20 bg-foreground/5 rounded-bl-full rounded-tr-2xl"
      />

      <div class="relative">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-6 bg-foreground rounded-full" />
          <h2 class="text-xl font-bold text-foreground">
            {{ categoriesTitle }}
          </h2>
        </div>
        <p class="text-sm mb-6 text-muted-foreground ml-4">
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
              'text-foreground hover:bg-secondary': !isCategorySelected(category),
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
                :class="
                  isCategorySelected(category)
                    ? 'bg-white/30'
                    : 'bg-secondary text-muted-foreground'
                "
              >
                {{ count }}
              </span>
            </span>
          </button>
        </div>

        <div
          v-if="props.selectedCategories.length > 0"
          class="mt-6 pt-4 border-t border-border flex justify-between items-center"
        >
          <div
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg"
          >
            <div class="w-2 h-2 bg-foreground rounded-full animate-pulse" />
            <span class="text-sm font-medium text-foreground">
              {{ props.selectedCategories.length }} {{ selectedText }}
            </span>
          </div>
          <button
            class="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            @click="clearAllCategories"
          >
            <Icon
              name="heroicons:x-mark"
              class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
            />
            <span>{{ clearAllText }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
