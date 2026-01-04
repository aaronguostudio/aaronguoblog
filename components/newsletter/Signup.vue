<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  variant?: 'inline' | 'footer'
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'inline',
  title: '',
  description: '',
})

const copied = ref(false)
const rssFeedUrl = 'https://aaronguo.com/rss.xml'

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rssFeedUrl)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div
    id="subscribe"
    :class="[
      'rounded-lg',
      variant === 'inline' ? 'bg-blue-50 dark:bg-blue-900/10 p-8' : 'bg-zinc-100 dark:bg-zinc-800 p-6',
    ]"
  >
    <div class="max-w-2xl mx-auto">
      <h3
        :class="[
          'font-bold mb-2',
          variant === 'inline' ? 'text-2xl' : 'text-xl',
        ]"
      >
        {{ title || t('rss.title') }}
      </h3>
      <p class="text-zinc-700 dark:text-zinc-300 mb-6">
        {{ description || t('rss.description') }}
      </p>

      <!-- RSS Feed URL -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          :value="rssFeedUrl"
          readonly
          class="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
        />
        <button
          @click="copyToClipboard"
          class="px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 justify-center"
        >
          <Icon v-if="!copied" name="mdi:content-copy" class="w-5 h-5" />
          <Icon v-else name="mdi:check" class="w-5 h-5" />
          <span>{{ copied ? t('rss.copied') : t('rss.copy') }}</span>
        </button>
      </div>

      <!-- RSS Reader Links -->
      <div class="space-y-3">
        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('rss.quickSubscribe') }}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            :href="`https://feedly.com/i/subscription/feed/${encodeURIComponent(rssFeedUrl)}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            Feedly
          </a>
          <a
            :href="`https://www.inoreader.com/?add_feed=${encodeURIComponent(rssFeedUrl)}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            Inoreader
          </a>
          <a
            :href="`https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(rssFeedUrl)}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            The Old Reader
          </a>
          <a
            :href="rssFeedUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            {{ t('rss.rawFeed') }}
          </a>
        </div>
      </div>

      <!-- Future Email Notice -->
      <div class="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          {{ t('rss.emailComingSoon') }}
        </p>
      </div>

      <p class="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
        {{ t('rss.privacy') }}
      </p>
    </div>
  </div>
</template>

