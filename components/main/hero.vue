<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>

<template>
  <div :key="locale" class="container mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 items-center">
      <div class="px-4">
        <h1
          class="text-black dark:text-zinc-300 font-semibold leading-tight text-4xl md:text-5xl my-5"
        >
          {{ t('home.title') }}
        </h1>
        <p class="dark:text-zinc-300">
          {{ t('home.description') }}
        </p>
      </div>
      <div class="px-4 justify-self-center">
        <LogoDog />
      </div>
    </div>
  </div>
</template>
