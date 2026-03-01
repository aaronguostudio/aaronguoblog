<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { socialLinks } from '~/data'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="container mx-auto py-8 sm:py-10">
    <div class="px-4 max-w-6xl mx-auto">
      <div class="relative">
        <!-- Decorative subtle background -->
        <div
          class="absolute inset-0 bg-foreground/[0.02] dark:bg-foreground/[0.03] rounded-3xl blur-3xl -z-10"
        />

        <div class="flex flex-col gap-5">
          <!-- Headline -->
          <h1 class="font-bold leading-tight text-3xl md:text-5xl text-foreground">
            {{ t('home.title') }}
          </h1>

          <!-- Subscribe + Social links -->
          <div class="flex items-center gap-3">
              <NuxtLink
                :to="localePath('/subscribe')"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-foreground rounded-lg transition-all duration-300"
                data-rybbit-event="subscribe_click"
                data-rybbit-prop-location="hero"
              >
                <Icon name="heroicons:envelope" class="w-4 h-4" />
                {{ t('footer.subscribe') }}
              </NuxtLink>
              <NuxtLink
                :to="localePath('/about')"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-foreground hover:text-primary rounded-lg transition-colors duration-300"
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
  </div>
</template>
