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

const email = ref('')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!email.value || !email.value.includes('@')) {
    errorMessage.value = 'Please enter a valid email address'
    status.value = 'error'
    return
  }

  status.value = 'loading'
  
  try {
    // TODO: Replace with your actual newsletter service endpoint
    // Examples: Buttondown, ConvertKit, Substack, Mailchimp
    // For now, this is a placeholder
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate success
    status.value = 'success'
    email.value = ''
    
    // Reset after 3 seconds
    setTimeout(() => {
      status.value = 'idle'
    }, 3000)
  } catch (error) {
    status.value = 'error'
    errorMessage.value = 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <div
    id="newsletter"
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
        {{ title || t('newsletter.title') }}
      </h3>
      <p class="text-zinc-700 dark:text-zinc-300 mb-6">
        {{ description || t('newsletter.description') }}
      </p>

      <form @submit.prevent="handleSubmit" class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="email"
          type="email"
          :placeholder="t('newsletter.placeholder')"
          :disabled="status === 'loading' || status === 'success'"
          class="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          :disabled="status === 'loading' || status === 'success'"
          class="px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="status === 'idle'">{{ t('newsletter.subscribe') }}</span>
          <span v-else-if="status === 'loading'">{{ t('newsletter.subscribing') }}</span>
          <span v-else-if="status === 'success'">✓ {{ t('newsletter.subscribed') }}</span>
          <span v-else>{{ t('newsletter.subscribe') }}</span>
        </button>
      </form>

      <p v-if="status === 'error'" class="mt-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>
      <p v-if="status === 'success'" class="mt-3 text-sm text-green-600 dark:text-green-400">
        {{ t('newsletter.successMessage') }}
      </p>
      
      <p class="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
        {{ t('newsletter.privacy') }}
      </p>
    </div>
  </div>
</template>

