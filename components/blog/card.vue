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
    class="group border dark:border-gray-800 overflow-hidden rounded-lg shadow-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-gray-900"
  >
    <NuxtLink :to="blogPath">
      <NuxtImg
        class="lg:h-48 md:h-36 w-full object-cover object-center group-hover:scale-[1.02] transition-all duration-500"
        width="300"
        :src="image"
        :alt="alt"
      />
      <div class="px-3 pb-4">
        <div class="flex-1">
          <div class="text-black dark:text-zinc-300 py-4">
            <div class="flex items-center">
              <LogoDate />
              {{ date }}
            </div>
            <div class="flex items-center gap-1 flex-wrap">
              <LogoTag />
              <template v-for="tag in tags" :key="tag">
                <span class="bg-gray-200 dark:bg-slate-900 rounded-md px-2 py-1 font-semibold">{{
                  tag
                }}</span>
              </template>
            </div>
          </div>
          <h2
            class="text-xl font-semibold text-black dark:text-zinc-300 pb-1 group-hover:text-sky-700 dark:group-hover:text-sky-400 truncate"
          >
            {{ title }}
          </h2>
          <p class="text-ellipsis line-clamp-2 text-base">
            {{ description }}
          </p>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
