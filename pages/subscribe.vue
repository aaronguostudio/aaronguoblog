<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

useHead({
  title: t('subscribe.title'),
  meta: [
    {
      name: 'description',
      content: t('subscribe.description'),
    },
  ],
})

// Generate OG Image
defineOgImageComponent('About', {
  headline: 'Subscribe 📬',
  title: t('subscribe.title'),
  description: t('subscribe.description'),
})
</script>

<template>
  <main class="container max-w-4xl mx-auto px-4 py-12">
    <!-- Page Header -->
    <div class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-foreground">
        {{ t('subscribe.title') }}
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        {{ t('subscribe.description') }}
      </p>
    </div>

    <!-- RSS Subscription Component -->
    <NewsletterSignup variant="inline" />

    <!-- What You'll Get -->
    <div class="mt-12 grid md:grid-cols-3 gap-6">
      <div class="p-6 bg-card rounded-lg border border-border">
        <div class="text-3xl mb-3">📚</div>
        <h3 class="font-semibold text-lg mb-2 text-foreground">
          {{ t('subscribe.playbooks') }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ t('subscribe.playbooksDesc') }}
        </p>
      </div>
      <div class="p-6 bg-card rounded-lg border border-border">
        <div class="text-3xl mb-3">💡</div>
        <h3 class="font-semibold text-lg mb-2 text-foreground">
          {{ t('subscribe.lessons') }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ t('subscribe.lessonsDesc') }}
        </p>
      </div>
      <div class="p-6 bg-card rounded-lg border border-border">
        <div class="text-3xl mb-3">🛠️</div>
        <h3 class="font-semibold text-lg mb-2 text-foreground">
          {{ t('subscribe.tools') }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ t('subscribe.toolsDesc') }}
        </p>
      </div>
    </div>

    <!-- What is RSS? -->
    <div class="mt-12 p-8 bg-secondary rounded-lg border border-border">
      <h2 class="text-2xl font-bold mb-4 text-foreground">
        {{ t('subscribe.whatIsRss') }}
      </h2>
      <p class="text-muted-foreground mb-4">
        {{ t('subscribe.rssExplanation') }}
      </p>
      <div class="space-y-3">
        <div class="flex items-start gap-3">
          <Icon
            name="mdi:check-circle"
            class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
          />
          <p class="text-sm text-muted-foreground">
            {{ t('subscribe.rssBenefit1') }}
          </p>
        </div>
        <div class="flex items-start gap-3">
          <Icon
            name="mdi:check-circle"
            class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
          />
          <p class="text-sm text-muted-foreground">
            {{ t('subscribe.rssBenefit2') }}
          </p>
        </div>
        <div class="flex items-start gap-3">
          <Icon
            name="mdi:check-circle"
            class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
          />
          <p class="text-sm text-muted-foreground">
            {{ t('subscribe.rssBenefit3') }}
          </p>
        </div>
        <div class="flex items-start gap-3">
          <Icon
            name="mdi:check-circle"
            class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
          />
          <p class="text-sm text-muted-foreground">
            {{ t('subscribe.rssBenefit4') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Popular RSS Readers -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-6 text-foreground text-center">
        {{ t('subscribe.popularReaders') }}
      </h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="https://feedly.com"
          target="_blank"
          rel="noopener noreferrer"
          class="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-colors text-center"
        >
          <h3 class="font-semibold text-foreground">Feedly</h3>
          <p class="text-xs text-muted-foreground mt-1">{{ t('subscribe.webMobile') }}</p>
        </a>
        <a
          href="https://www.inoreader.com"
          target="_blank"
          rel="noopener noreferrer"
          class="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-colors text-center"
        >
          <h3 class="font-semibold text-foreground">Inoreader</h3>
          <p class="text-xs text-muted-foreground mt-1">{{ t('subscribe.webMobile') }}</p>
        </a>
        <a
          href="https://netnewswire.com"
          target="_blank"
          rel="noopener noreferrer"
          class="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-colors text-center"
        >
          <h3 class="font-semibold text-foreground">NetNewsWire</h3>
          <p class="text-xs text-muted-foreground mt-1">{{ t('subscribe.macIos') }}</p>
        </a>
        <a
          href="https://reederapp.com"
          target="_blank"
          rel="noopener noreferrer"
          class="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-colors text-center"
        >
          <h3 class="font-semibold text-foreground">Reeder</h3>
          <p class="text-xs text-muted-foreground mt-1">{{ t('subscribe.macIos') }}</p>
        </a>
      </div>
    </div>
  </main>
</template>
