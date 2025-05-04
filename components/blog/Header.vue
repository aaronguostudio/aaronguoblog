<script setup lang="ts">
const localePath = useLocalePath()

interface Props {
  title: string
  image: string
  alt: string
  description: string
  date: string
  tags: Array<string>
}

withDefaults(defineProps<Props>(), {
  title: 'no-title',
  image: '#',
  alt: 'no-img',
  description: 'no description',
  date: 'no-date',
  tags: () => [],
})
</script>

<template>
  <header class="flex flex-col gap-4">
    <h1 class="text-xl dark:text-zinc-300 md:text-3xl lg:text-4xl font-bold text-center">
      {{ title || '' }}
    </h1>
    <!-- <NuxtImg
      v-if="image"
      :src="image || ''"
      :alt="alt || ''"
      width="600"
      class="m-auto rounded-2xl shadow-lg h-32 md:h-72 w-4/6 md:w-4/5 content-center object-cover"
    /> -->
    <p class="text-xs sm:text-sm mx-auto text-center text-zinc-600 dark:text-zinc-400">
      {{ description }}
    </p>
    <div class="flex w-full justify-center text-xs md:text-base">
      <div class="md:flex text-black dark:text-zinc-300 content-center gap-8 text-xs sm:text-sm">
        <div class="flex items-center font-semibold">
          <LogoDate />
          <p>{{ date || '' }}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <LogoTag />
          <span v-for="(tag, n) in tags" :key="n">
            <NuxtLink :to="localePath(`/blogs?categories=${tag.toLocaleLowerCase()}`)">
              <span
                class="bg-gray-200 dark:bg-slate-900 rounded-md px-2 py-1 font-semibold hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors duration-200"
                >{{ tag }}</span
              >
            </NuxtLink>
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
