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
const activeId = ref('')

let headingElements: HTMLElement[] = []
let animationFrame: number | undefined

function getActivationOffset() {
  const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0
  return headerHeight + 16
}

function updateActiveLink() {
  const activationOffset = getActivationOffset()
  const activeHeading = headingElements
    .filter((heading) => heading.getBoundingClientRect().top <= activationOffset)
    .at(-1)

  activeId.value = activeHeading?.id || ''
}

function scheduleActiveLinkUpdate() {
  if (animationFrame !== undefined) return

  animationFrame = window.requestAnimationFrame(() => {
    animationFrame = undefined
    updateActiveLink()
  })
}

function setActiveLink(id: string) {
  activeId.value = id
}

onMounted(async () => {
  await nextTick()
  headingElements = links
    .map((link) => document.getElementById(link.id))
    .filter((heading): heading is HTMLElement => heading !== null)

  updateActiveLink()
  window.addEventListener('scroll', scheduleActiveLinkUpdate, { passive: true })
  window.addEventListener('resize', scheduleActiveLinkUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleActiveLinkUpdate)
  window.removeEventListener('resize', scheduleActiveLinkUpdate)

  if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <nav v-if="links.length" :aria-label="$t('blogs.tableOfContent')">
    <div
      class="flex min-w-[200px] flex-col gap-2 rounded-md border p-4 dark:border-gray-800 dark:bg-slate-900"
    >
      <h2 class="text-lg font-bold">{{ $t('blogs.tableOfContent') }}</h2>
      <div class="flex flex-col gap-0.5">
        <NuxtLink
          v-for="link in links"
          :key="link.id"
          :to="`#${link.id}`"
          :aria-current="activeId === link.id ? 'location' : undefined"
          :class="[
            'relative block rounded-sm py-1 pl-3 text-sm leading-snug transition-colors duration-150 motion-reduce:transition-none before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-transparent before:transition-colors before:duration-150 motion-reduce:before:transition-none',
            activeId === link.id
              ? 'font-medium text-foreground before:bg-foreground'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="setActiveLink(link.id)"
        >
          {{ link.text }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
