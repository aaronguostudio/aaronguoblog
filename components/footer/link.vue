<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <div class="flex flex-col dark:text-zinc-300 my-5 md:my-0 md:justify-self-center">
    <p class="text-black dark:text-zinc-300 text-base font-semibold">Quick Link</p>
    <NuxtLink :to="localePath('/')" class="hover:underline"> Home </NuxtLink>
    <NuxtLink :to="localePath('/blogs')" class="hover:underline"> Blogs </NuxtLink>
    <NuxtLink :to="localePath('/about')" class="hover:underline"> About Me </NuxtLink>
  </div>
</template>
