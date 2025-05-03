<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const { path } = route

// Determine the correct collection and content path
const collection = computed(() => locale.value)

// Transform the URL path to the content path
const contentPath = computed(() => {
  // Extract the blog slug from the URL path
  let blogSlug = path

  // Remove language prefix if present
  if (path.startsWith('/zh/blogs/')) {
    blogSlug = path.replace('/zh/blogs/', '')
  } else if (path.startsWith('/blogs/')) {
    blogSlug = path.replace('/blogs/', '')
  }

  // Construct the content path based on the collection and slug
  return `/blogs/${collection.value}/${blogSlug}`
})

const articles = await queryCollection(collection.value as 'en' | 'zh')
  .path(contentPath.value)
  .first()

const links = articles?.body?.toc?.links || []
</script>

<template>
  <div class="lg:col-span-3 sticky top-28 h-96 hidden lg:block justify-self-end">
    <div class="border dark:border-gray-800 p-3 rounded-md min-w-[200px] dark:bg-slate-900">
      <h1 class="text-sm font-bold mb-3 border-b dark:border-gray-800 pb-2">Table Of Content</h1>
      <NuxtLink
        v-for="link in links"
        :key="link.id"
        :to="`#${link.id}`"
        class="block text-xs mb-3 hover:underline"
      >
        {{ link.text }}
      </NuxtLink>
    </div>
  </div>
</template>
