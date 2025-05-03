<script lang="ts" setup>
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

// Fix the path to ensure it uses the correct language prefix
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
    class="group border border-border overflow-hidden rounded-lg shadow-sm text-foreground bg-card"
  >
    <NuxtLink :to="blogPath">
      <div class="p-4 flex flex-col justify-between gap-4">
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-foreground pb-1 group-hover:text-primary truncate">
            {{ title }}
          </h2>
          <p class="text-ellipsis line-clamp-2 text-sm">
            {{ description }}
          </p>
        </div>
        <div class="text-foreground flex flex-col gap-y-1">
          <div class="flex items-center">
            <LogoDate />
            {{ date }}
          </div>
          <div class="flex items-center gap-1 flex-wrap">
            <LogoTag />
            <template v-for="tag in tags" :key="tag">
              <span class="bg-secondary text-secondary-foreground rounded-md px-2">{{ tag }}</span>
            </template>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
