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
    <!-- Feature Image - Only shown if image is provided -->
    <img
      v-if="image && image !== '' && image !== '#'"
      :src="image"
      :alt="alt"
      class="mx-auto rounded-2xl shadow-lg max-w-3xl w-full my-4"
    />
    <div class="flex w-full justify-center text-xs md:text-base">
      <div class="md:flex text-black dark:text-zinc-300 content-center gap-8 text-xs sm:text-sm">
        <div class="flex items-center font-semibold">
          <LogoDate />
          <p>{{ date || '' }}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <LogoTag />
          <span v-for="(tag, n) in tags" :key="n" class="inline-block mr-1 mb-1">
            <NuxtLink
              v-slot="{ navigate }"
              :to="localePath(`/blogs?categories=${tag.toLocaleLowerCase()}`)"
              custom
            >
              <span
                class="bg-gray-200 dark:bg-slate-900 rounded-md px-2 py-1 font-semibold hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
                @click="navigate"
                >{{ tag }}</span
              >
            </NuxtLink>
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
