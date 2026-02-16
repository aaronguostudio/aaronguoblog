<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="py-5 dark:border-gray-800 mt-2 text-zinc-700 dark:text-zinc-300">
    <div class="px-4 container max-w-8xl mx-auto">
      <!-- Footer Links -->
      <div class="flex justify-center items-center gap-6 mb-4">
        <NuxtLink
          to="/subscribe"
          class="text-sm hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Icon name="mdi:rss" class="w-4 h-4" />
          <span>{{ t('footer.subscribe') }}</span>
        </NuxtLink>
        <a
          href="/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Icon name="mdi:rss-box" class="w-4 h-4" />
          <span>RSS Feed</span>
        </a>
        <NuxtLink
          to="/drum"
          class="text-sm hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Icon name="mdi:music-circle" class="w-4 h-4" />
          <span>{{ t('navigation.drum') }}</span>
        </NuxtLink>
      </div>

      <div class="dark:border-gray-800 text-center p-2 text-sm">© 2020-2026 Aaron Guo</div>
    </div>
  </div>
</template>

<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: all 0.4s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
