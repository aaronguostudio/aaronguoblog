<script lang="ts" setup>
import { getBlogCategoryLabel } from '~/utils/blog-taxonomy'

interface Props {
  path?: string
  title?: string
  date?: string
  description?: string
  image?: string
  alt?: string
  ogImage?: string
  categories?: Array<string>
  tags?: Array<string>
  published?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  path: '/',
  title: 'no-title',
  date: 'no-date',
  description: 'no-description',
  image: '/blogs-img/blog.jpg',
  alt: 'no-alt',
  ogImage: '/blogs-img/blog.jpg',
  categories: () => [],
  tags: () => [],
  published: false,
})

const localePath = useLocalePath()
const { locale } = useI18n()

const categoryLabels = computed(() =>
  props.categories.map((category) => getBlogCategoryLabel(category, locale.value)),
)

// Fix the path to ensure it uses the correct language prefix
const blogPath = computed(() => {
  // If the path already has the correct format, return it
  if (!props.path?.includes('/blogs/zh/') && !props.path?.includes('/blogs/en/')) {
    return localePath(props.path || '/')
  }

  // Extract the blog slug from the path
  let blogSlug = props.path
  if (props.path?.includes('/blogs/zh/')) {
    blogSlug = props.path.replace('/blogs/zh/', '/blogs/')
  } else if (props.path?.includes('/blogs/en/')) {
    blogSlug = props.path.replace('/blogs/en/', '/blogs/')
  }

  return localePath(blogSlug || '/')
})
</script>

<template>
  <article
    class="group overflow-hidden rounded-lg border border-[var(--line-card)] bg-card text-foreground transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--line-control)] hover:shadow-md motion-reduce:transition-none"
  >
    <NuxtLink :to="blogPath" class="block">
      <!-- Feature Image - Always shown with default fallback -->
      <div class="overflow-hidden">
        <NuxtImg
          class="h-72 w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
          :src="image || '/blogs-img/blog.jpg'"
          :alt="alt"
          loading="lazy"
          sizes="100vw sm:50vw lg:33vw"
        />
      </div>
      <div class="flex min-h-[12.5rem] flex-col p-5">
        <h2
          class="line-clamp-2 text-xl font-semibold leading-snug text-foreground transition-colors"
        >
          {{ title }}
        </h2>
        <p class="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {{ description }}
        </p>
        <div class="mt-5 text-sm text-muted-foreground md:flex md:items-center md:gap-5">
          <div class="flex items-center gap-1.5">
            <LogoDate class="h-4 w-4" />
            <p>{{ date }}</p>
          </div>
          <div v-if="categoryLabels.length > 0" class="mt-2 flex flex-wrap items-center gap-1.5 md:mt-0">
            <LogoTag class="h-4 w-4" />
            <span v-for="category in categoryLabels" :key="category">
              <span
                class="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
              >
                {{ category }}
              </span>
            </span>
          </div>
        </div>
        <div class="mt-auto flex items-center gap-2 pt-5 text-sm font-medium text-foreground">
          <p>Read More</p>
          <LogoArrow class="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
