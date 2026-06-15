<script setup lang="ts">
import { getBlogCategoryLabel } from '~/utils/blog-taxonomy'

const localePath = useLocalePath()
const { locale } = useI18n()

interface Props {
  title: string
  image: string
  alt: string
  description: string
  date: string
  categories: Array<string>
  tags: Array<string>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'no-title',
  image: '#',
  alt: 'no-img',
  description: 'no description',
  date: 'no-date',
  categories: () => [],
  tags: () => [],
})

const categoryLinks = computed(() =>
  props.categories.map((category) => ({
    id: category,
    label: getBlogCategoryLabel(category, locale.value),
  })),
)
</script>

<template>
  <header class="flex flex-col gap-4 py-8">
    <!-- Title -->
    <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
      {{ title }}
    </h1>

    <!-- Meta: date + tags -->
    <div class="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
      <div class="flex items-center gap-1.5 font-medium">
        <LogoDate class="w-4 h-4" />
        <span>{{ date || '' }}</span>
      </div>
      <div v-if="categoryLinks.length > 0" class="flex items-center gap-2 flex-wrap">
        <LogoTag class="w-4 h-4" />
        <span v-for="category in categoryLinks" :key="category.id">
          <NuxtLink
            v-slot="{ navigate }"
            :to="localePath(`/blogs?categories=${category.id}`)"
            custom
          >
            <span
              class="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-medium hover:bg-muted transition-colors duration-200 cursor-pointer"
              @click="navigate"
              >{{ category.label }}</span
            >
          </NuxtLink>
        </span>
      </div>
    </div>

    <!-- Feature Image - Only shown if image is provided -->
    <img
      v-if="image && image !== '' && image !== '#'"
      :src="image"
      :alt="alt"
      class="rounded-2xl shadow-lg w-full mt-2"
    />
  </header>
</template>
