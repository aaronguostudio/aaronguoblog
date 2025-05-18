<script lang="ts" setup>
import { formatDate } from '~/utils/date'

/**
 * Blog card component props
 */
interface Props {
  path: string
  title: string
  date: string
  description: string
  image: string
  alt: string
  ogImage: string
  tags: Array<string>
  published: boolean
}

const props = withDefaults(defineProps<Props>(), {
  path: '/',
  title: 'no-title',
  date: 'no-date',
  description: 'no-description',
  image: '/blogs-img/blog.jpg',
  alt: 'no-alt',
  ogImage: '/blogs-img/blog.jpg',
  tags: () => [],
  published: false,
})

const localePath = useLocalePath()
const { locale } = useI18n()

/**
 * Format the date for display
 */
const formattedDate = computed(() => {
  return formatDate(props.date, locale.value === 'zh' ? 'zh-CN' : 'en-US')
})

/**
 * Fix the path to ensure it uses the correct language prefix
 */
const blogPath = computed(() => {
  // If the path already has the correct format, return it
  if (!props.path.includes('/blogs/zh/') && !props.path.includes('/blogs/en/')) {
    return localePath(props.path)
  }

  // Extract the blog slug from the path
  let blogSlug = props.path
  if (props.path.includes('/blogs/zh/')) {
    blogSlug = props.path.replace('/blogs/zh/', '/blogs/')
  } else if (props.path.includes('/blogs/en/')) {
    blogSlug = props.path.replace('/blogs/en/', '/blogs/')
  }

  return localePath(blogSlug)
})
</script>

<template>
  <article
    class="group border border-border overflow-hidden rounded-lg shadow-sm text-foreground bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20"
  >
    <div class="p-5 flex flex-col justify-between gap-4 h-full">
      <div class="flex-1">
        <NuxtLink :to="blogPath" class="block">
          <h2
            class="text-lg font-semibold text-foreground pb-2 group-hover:text-primary truncate transition-colors duration-300"
          >
            {{ title }}
          </h2>
        </NuxtLink>
        <p class="text-ellipsis line-clamp-2 text-body-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <div class="text-foreground flex flex-col gap-y-2 pt-2">
        <div class="flex items-center text-caption text-muted-foreground">
          <LogoDate class="mr-1.5 h-4 w-4" />
          {{ formattedDate }}
        </div>
        <div v-if="tags.length > 0" class="flex items-center gap-1.5 flex-wrap">
          <LogoTag class="h-4 w-4 text-muted-foreground" />
          <template v-for="tag in tags" :key="tag">
            <NuxtLink :to="localePath(`/blogs?categories=${tag.toLocaleLowerCase()}`)">
              <span
                class="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-caption transition-colors duration-300 hover:bg-primary/10"
              >
                {{ tag }}
              </span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </article>
</template>
