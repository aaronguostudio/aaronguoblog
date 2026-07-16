<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div>
    <!-- Newsletter Section — force dark theme tokens so text/inputs contrast on black bg -->
    <div class="dark w-full bg-black py-10 px-4">
      <div class="max-w-2xl mx-auto">
        <NewsletterSignup variant="section" />
      </div>
    </div>

    <!-- Footer Bar -->
    <div class="w-full bg-black text-white/70 py-6 border-t border-white/10">
      <div class="px-4 container max-w-8xl mx-auto">
        <!-- Footer Links -->
        <div class="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <NuxtLink
            :to="localePath('/subscribe')"
            class="text-sm hover:text-white transition-colors flex items-center gap-1"
            data-rybbit-event="subscribe_click"
            data-rybbit-prop-location="footer"
          >
            <Icon name="mdi:rss" class="w-4 h-4" />
            <span>{{ t('footer.subscribe') }}</span>
          </NuxtLink>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            <Icon name="mdi:rss-box" class="w-4 h-4" />
            <span>RSS Feed</span>
          </a>
          <NuxtLink
            :to="localePath('/notes')"
            class="text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            <Icon name="heroicons:pencil-square" class="w-4 h-4" />
            <span>{{ t('navigation.notes') }}</span>
          </NuxtLink>
          <NuxtLink
            :to="localePath('/videos')"
            class="text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            <Icon name="mdi:youtube" class="w-4 h-4" />
            <span>{{ t('navigation.videos') }}</span>
          </NuxtLink>
          <NuxtLink
            :to="localePath('/learn')"
            class="text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            <Icon name="heroicons:academic-cap" class="w-4 h-4" />
            <span>{{ t('navigation.learn') }}</span>
          </NuxtLink>
        </div>

        <div class="text-center p-2 text-sm text-white/50">© 2020-2026 Aaron Guo</div>
      </div>
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
