<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto mb-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 items-center">
      <div class="px-4">
        <h1
          class="text-black dark:text-zinc-300 font-semibold leading-tight text-4xl md:text-5xl my-5"
        >
          {{ t('blogs.title') }}
        </h1>
        <p class="dark:text-zinc-300">
          {{ t('blogs.description') }}
        </p>
      </div>
      <div class="px-4 justify-self-center">
        <LogoDogpow />
      </div>
    </div>
  </div>
</template>
