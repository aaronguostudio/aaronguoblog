<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <a
    href="https://skills.aaronguo.com"
    target="_blank"
    rel="noopener noreferrer"
    :title="t('navigation.opensInNewTab')"
    class="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 leading-none text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    {{ t('navigation.skills') }}
    <Icon name="heroicons:arrow-top-right-on-square" aria-hidden="true" class="h-3.5 w-3.5" />
    <span class="sr-only">({{ t('navigation.opensInNewTab') }})</span>
  </a>
</template>
