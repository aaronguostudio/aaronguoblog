<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="py-5">
    <div class="sm:grid grid-cols-8 px-4 py-5 sm:py-9 gap-5 container max-w-8xl mx-auto">
      <div class="col-span-5 max-w-md">
        <div class="flex justify-between">
          <div>
            <h1 class="text-xl sm:text-4xl pb-2 font-bold">
              {{ t('about.title') }}
            </h1>
          </div>
          <div class="sm:hidden block col-span-3 pb-5 dark:text-[#F1F2F4]"></div>
        </div>
        <h3 class="text-base sm:text-3xl font-semibold pb-7 sm:pb-12">
          {{ t('about.description') }}
        </h3>
        <p>{{ t('about.aboutMe') }}</p>
      </div>
      <div class="hidden sm:block col-span-3"></div>
    </div>
  </div>
</template>
