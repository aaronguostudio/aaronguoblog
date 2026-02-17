<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { socialLinks } from '~/data'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="container mx-auto py-12 sm:py-16">
    <div class="px-4 max-w-4xl mx-auto">
      <div class="relative">
        <!-- Decorative subtle background -->
        <div
          class="absolute inset-0 bg-foreground/[0.02] dark:bg-foreground/[0.03] rounded-3xl blur-3xl -z-10"
        />

        <div class="flex flex-col gap-6">
          <!-- Avatar + Name -->
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-foreground flex items-center justify-center text-background text-2xl sm:text-3xl font-bold shadow-lg"
            >
              AG
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-foreground">Aaron Guo</h2>
              <p class="text-sm sm:text-base text-muted-foreground">
                Product Builder · Engineer · AI Practitioner
              </p>
            </div>
          </div>

          <!-- Headline -->
          <h1 class="font-bold leading-tight text-3xl md:text-5xl text-foreground">
            {{ t('home.title') }}
          </h1>

          <!-- Subheadline -->
          <p class="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl">
            {{ t('home.description') }}
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 mt-4">
            <NuxtLink
              :to="localePath('/subscribe')"
              class="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-foreground bg-primary hover:bg-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
            >
              <span class="relative z-10 flex items-center gap-2">
                <Icon name="heroicons:envelope" class="w-5 h-5" />
                {{ t('footer.subscribe') }}
              </span>
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-foreground bg-secondary hover:bg-muted rounded-xl transition-all duration-300 border-2 border-border hover:border-foreground/20 hover:scale-105"
            >
              <span class="flex items-center gap-2">
                {{ t('navigation.about') }}
                <Icon
                  name="heroicons:arrow-right"
                  class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                />
              </span>
            </NuxtLink>
          </div>

          <!-- Social links row -->
          <div class="flex items-center gap-4 mt-2">
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
              <Icon name="mdi:twitter" class="w-5 h-5" />
            </a>
            <a
              :href="socialLinks.youtubeLink"
              target="_blank"
              rel="noopener noreferrer"
              class="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="YouTube"
              data-rybbit-event="outbound_click"
              data-rybbit-prop-platform="youtube"
              data-rybbit-prop-location="hero"
            >
              <Icon name="mdi:youtube" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
