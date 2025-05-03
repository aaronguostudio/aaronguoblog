<script setup lang="ts">
// import { navbarData } from '../../data'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const colorMode = useColorMode()
function onClick(val: string) {
  colorMode.preference = val
}

const route = useRoute()
function isActive(path: string) {
  // Handle both localized and non-localized paths
  const currentPath = route.path
  return (
    currentPath === path ||
    currentPath.startsWith(`/${locale.value}${path}`) ||
    currentPath.startsWith(path)
  )
}
</script>

<template>
  <div class="py-6">
    <div class="flex items-center px-4 container max-w-8xl justify-between mx-auto">
      <ul class="flex items-baseline">
        <li class="text-base sm:text-3xl font-bold">
          <NuxtLink :to="localePath('/')">
            {{ t('navigation.homeTitle') }}
          </NuxtLink>
        </li>
      </ul>
      <ul class="flex items-center space-x-4 sm:space-x-6 text-sm sm:text-lg">
        <li>
          <NuxtLink
            :to="localePath('/')"
            :class="['opacity-50', { '!opacity-100': isActive('/') }]"
          >
            {{ t('navigation.home') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            :to="localePath('/blogs')"
            :class="['opacity-50', { '!opacity-100': isActive('/blogs') }]"
          >
            {{ t('navigation.blogs') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            :to="localePath('/categories')"
            :class="['opacity-50', { '!opacity-100': isActive('/categories') }]"
          >
            {{ t('navigation.categories') }}
          </NuxtLink>
        </li>
        <li title="About Me">
          <NuxtLink
            :to="localePath('/about')"
            aria-label="About me"
            :class="['opacity-50', { '!opacity-100': isActive('/about') }]"
          >
            {{ t('navigation.about') }}
          </NuxtLink>
        </li>
        <li class="flex items-center space-x-2" title="Change Language">
          <NuxtLink
            :to="switchLocalePath('en')"
            class="px-2 py-1 text-sm font-medium rounded transition-all"
            :class="
              locale === 'en' ? 'bg-gray-200 dark:bg-gray-700' : 'opacity-60 hover:opacity-100'
            "
          >
            EN
          </NuxtLink>
          <NuxtLink
            :to="switchLocalePath('zh')"
            class="px-2 py-1 text-sm font-medium rounded transition-all"
            :class="
              locale === 'zh' ? 'bg-gray-200 dark:bg-gray-700' : 'opacity-60 hover:opacity-100'
            "
          >
            中
          </NuxtLink>
        </li>
        <li class="flex items-center">
          <ClientOnly>
            <button
              v-if="colorMode.value === 'light'"
              name="light-mode"
              title="Switch to Dark Mode"
              class="flex items-center rounded transition-all opacity-60 hover:opacity-100"
              @click="onClick('dark')"
            >
              <Icon name="material-symbols:moon-stars" size="18" />
            </button>
            <button
              v-if="colorMode.value === 'dark'"
              name="dark-mode"
              title="Switch to Light Mode"
              class="flex items-center rounded transition-all opacity-60 hover:opacity-100"
              @click="onClick('light')"
            >
              <Icon name="material-symbols:light-mode-outline-rounded" size="18" />
            </button>
            <template #fallback>
              <!-- this will be rendered on server side -->
              <Icon name="material-symbols:moon-stars" size="18" />
            </template>
          </ClientOnly>
        </li>
      </ul>
    </div>
  </div>
</template>
