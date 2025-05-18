<script setup lang="ts">
import { footerData } from '~/data'
</script>

<template>
  <div>
    <p class="text-black dark:text-zinc-300 text-base py-1 font-semibold">About This Site</p>
    <p class="py-2 dark:text-zinc-300">
      {{ footerData.aboutTheSite }}
      I built it based on the
      <UiSafeLink :href="footerData.aboutTheSiteLink.href" target="_blank" class="text-blue-500">
        {{ footerData.aboutTheSiteLink.text }} </UiSafeLink
      >.
    </p>
  </div>
</template>
