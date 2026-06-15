<script setup lang="ts">
import { getBlogCategoryLabel, normalizeBlogCategoryId } from '~/utils/blog-taxonomy'

const { locale } = useI18n()

const route = useRoute()

// Take category from route params and display the canonical label.
const category = computed(() => {
  const name = route.params.category || ''
  let strName = ''

  if (Array.isArray(name)) strName = name.at(0) || ''
  else strName = name

  const categoryId = normalizeBlogCategoryId(strName)
  return categoryId ? getBlogCategoryLabel(categoryId, locale.value) : strName
})
</script>

<template>
  <div class="container mx-auto">
    <div class="p-6 my-4 mx-2 rounded-md bg-gray-200 dark:bg-slate-900">
      <h1 class="text-black dark:text-white font-semibold leading-tight text-xl md:text-2xl">
        #{{ category }}
      </h1>
    </div>
  </div>
</template>
