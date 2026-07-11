<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { socialLinks } from '~/data'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div
    class="relative flex min-h-[14rem] items-center overflow-hidden px-5 py-6 sm:min-h-[15rem] sm:px-7 sm:py-7 lg:min-h-[15rem] lg:px-10 lg:py-6 xl:px-12"
  >
    <!-- Decorative subtle background -->
    <div
      class="pointer-events-none absolute inset-0 bg-foreground/[0.02] blur-3xl dark:bg-foreground/[0.03]"
    />

    <div class="relative w-full max-w-3xl">
      <div class="flex flex-col gap-4">
        <!-- Headline -->
        <h1 class="font-bold leading-[1.05] text-3xl text-foreground sm:text-4xl md:text-5xl">
          {{ t('home.title') }}
        </h1>

        <!-- Subscribe + Social links -->
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <NuxtLink
            :to="localePath('/subscribe')"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-foreground"
            data-rybbit-event="subscribe_click"
            data-rybbit-prop-location="hero"
          >
            <Icon name="heroicons:envelope" class="w-4 h-4" />
            {{ t('footer.subscribe') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/about')"
            class="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-foreground transition-colors duration-300 hover:text-primary"
          >
            {{ t('navigation.about') }}
            <Icon name="heroicons:arrow-right" class="w-3.5 h-3.5" />
          </NuxtLink>

          <div class="w-px h-5 bg-border" />

          <a
            :href="socialLinks.githubLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
            data-rybbit-event="outbound_click"
            data-rybbit-prop-platform="github"
            data-rybbit-prop-location="hero"
          >
            <Icon name="mdi:github" class="w-5 h-5" />
          </a>
          <a
            :href="socialLinks.linkedinLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="LinkedIn"
            data-rybbit-event="outbound_click"
            data-rybbit-prop-platform="linkedin"
            data-rybbit-prop-location="hero"
          >
            <Icon name="mdi:linkedin" class="w-5 h-5" />
          </a>
          <a
            :href="socialLinks.twitterLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Twitter/X"
            data-rybbit-event="outbound_click"
            data-rybbit-prop-platform="twitter"
            data-rybbit-prop-location="hero"
          >
            <Icon name="ri:twitter-x-fill" class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
