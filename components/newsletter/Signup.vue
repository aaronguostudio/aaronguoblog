<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  variant?: 'inline' | 'footer' | 'section'
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'inline',
  title: '',
  description: '',
})

// Email subscription state
const email = ref('')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

const subscribe = async () => {
  const trimmed = email.value.trim()

  // Client-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!trimmed || !emailRegex.test(trimmed)) {
    status.value = 'error'
    message.value = t('newsletter.invalidEmail')
    return
  }

  status.value = 'loading'
  message.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string; status: string }>(
      '/api/subscribe',
      {
        method: 'POST',
        body: { email: trimmed },
      },
    )

    status.value = 'success'
    if (res.status === 'existing') {
      message.value = t('newsletter.alreadySubscribed')
    } else {
      message.value = t('newsletter.success')
    }
    email.value = ''
  } catch (err: any) {
    status.value = 'error'
    message.value = err?.data?.message || err?.statusMessage || t('newsletter.error')
  }
}

// RSS state
const copied = ref(false)
const showRss = ref(false)
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
      variant === 'section' ? '' : 'rounded-lg',
      variant === 'inline' ? 'bg-secondary p-8' : variant === 'section' ? '' : 'bg-muted p-6',
    ]"
  >
    <div class="max-w-2xl mx-auto">
      <!-- Newsletter Header -->
      <h3 :class="['font-bold mb-2', variant === 'inline' ? 'text-2xl' : 'text-xl']">
        {{ title || t('newsletter.title') }}
      </h3>
      <p class="text-muted-foreground mb-6">
        {{ description || t('newsletter.description') }}
      </p>

      <!-- Email Subscription Form -->
      <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          v-model="email"
          type="email"
          :placeholder="t('newsletter.placeholder')"
          :disabled="status === 'loading'"
          class="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          :disabled="status === 'loading'"
          class="px-6 py-3 font-semibold text-primary-foreground bg-primary hover:bg-foreground disabled:bg-primary/50 rounded-lg transition-colors flex items-center gap-2 justify-center whitespace-nowrap"
        >
          <Icon v-if="status === 'loading'" name="mdi:loading" class="w-5 h-5 animate-spin" />
          <Icon v-else name="mdi:email-outline" class="w-5 h-5" />
          <span>{{
            status === 'loading' ? t('newsletter.subscribing') : t('newsletter.subscribe')
          }}</span>
        </button>
      </form>

      <!-- Status Message -->
      <p
        v-if="message"
        :class="[
          'text-sm mb-4',
          status === 'success'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400',
        ]"
      >
        {{ message }}
      </p>

      <!-- RSS Toggle -->
      <div class="mt-6 pt-6 border-t border-border">
        <button
          @click="showRss = !showRss"
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="mdi:rss" class="w-4 h-4" />
          <span>{{ t('rss.title') }}</span>
          <Icon :name="showRss ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-4 h-4" />
        </button>

        <!-- RSS Content (collapsible) -->
        <div v-if="showRss" class="mt-4 space-y-4">
          <p class="text-sm text-muted-foreground">
            {{ t('rss.description') }}
          </p>

          <!-- RSS Feed URL -->
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              :value="rssFeedUrl"
              readonly
              class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm"
            />
            <button
              @click="copyToClipboard"
              class="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 justify-center"
            >
              <Icon v-if="!copied" name="mdi:content-copy" class="w-4 h-4" />
              <Icon v-else name="mdi:check" class="w-4 h-4" />
              <span>{{ copied ? t('rss.copied') : t('rss.copy') }}</span>
            </button>
          </div>

          <!-- RSS Reader Links -->
          <div class="space-y-2">
            <p class="text-xs font-semibold text-muted-foreground">
              {{ t('rss.quickSubscribe') }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                :href="`https://feedly.com/i/subscription/feed/${encodeURIComponent(rssFeedUrl)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-center"
              >
                Feedly
              </a>
              <a
                :href="`https://www.inoreader.com/?add_feed=${encodeURIComponent(rssFeedUrl)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-center"
              >
                Inoreader
              </a>
              <a
                :href="`https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(rssFeedUrl)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-center"
              >
                The Old Reader
              </a>
              <a
                :href="rssFeedUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-center"
              >
                {{ t('rss.rawFeed') }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <p class="mt-4 text-xs text-muted-foreground">
        {{ t('rss.privacy') }}
      </p>
    </div>
  </div>
</template>
