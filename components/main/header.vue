<script setup lang="ts">
import { navbarData } from '../../data'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const colorMode = useColorMode()
function onClick(val: string) {
  colorMode.preference = val
}

const route = useRoute()
function isActive(path: string) {
  return route.path.startsWith(path)
}

// Add i18n composables
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  // Ensure locales.value is treated as an array
  const locs = Array.isArray(locales.value) ? locales.value : []
  // Filter out the current locale if desired (optional)
  // return locs.filter(i => i.code !== locale.value)
  return locs
})
</script>

<template>
  <div class="py-5 border-b dark:border-gray-800 font-semibold">
    <div class="flex px-6 container max-w-5xl justify-between mx-auto items-baseline">
      <ul class="flex items-baseline space-x-5">
        <li class="text-base sm:text-2xl font-bold">
          <NuxtLink :to="localePath('/')" :class="{ underline: $route.path === '/' }">
            {{ t('navigation.homeTitle') }}
          </NuxtLink>
        </li>
      </ul>
      <ul class="flex items-center space-x-3 sm:space-x-6 text-sm sm:text-lg">
        <li>
          <NuxtLink :to="localePath('/blogs')" :class="{ underline: isActive('/blogs') }">
            {{ t('navigation.blogs') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="localePath('/categories')" :class="{ underline: isActive('/categories') }">
            {{ t('navigation.categories') }}
          </NuxtLink>
        </li>
        <li title="About Me">
          <NuxtLink
            :to="localePath('/about')"
            aria-label="About me"
            :class="{ underline: $route.path === '/about' }"
          >
            {{ t('navigation.about') }}
          </NuxtLink>
        </li>
        <li class="flex items-center space-x-2" title="Change Language">
          <NuxtLink :to="$switchLocalePath('en')">
            <Icon
              :name="locale === 'en' ? 'icon-park-outline:english' : 'ri:english-input'"
              :size="locale === 'en' ? '28' : '16'"
            />
          </NuxtLink>
          <NuxtLink :to="$switchLocalePath('zh')">
            <Icon
              :name="
                locale === 'zh'
                  ? 'icon-park-outline:chinese'
                  : 'mdi:ideogram-chinese-japanese-korean-variant'
              "
              :size="locale === 'zh' ? '28' : '16'"
            />
          </NuxtLink>
        </li>
        <li>
          <ClientOnly>
            <button
              v-if="colorMode.value === 'light'"
              name="light-mode"
              title="Light"
              class="hover:scale-110 transition-all ease-out hover:cursor-pointer"
              @click="onClick('dark')"
            >
              <Icon name="icon-park:moon" size="20" />
            </button>
            <button
              v-if="colorMode.value === 'dark'"
              name="dark-mode"
              title="Dark"
              class="hover:scale-110 transition-all ease-out hover:cursor-pointer"
              @click="onClick('light')"
            >
              <Icon name="noto:sun" size="20" />
            </button>
            <template #fallback>
              <!-- this will be rendered on server side -->
              <Icon name="svg-spinners:180-ring" size="20" />
            </template>
          </ClientOnly>
        </li>
      </ul>
    </div>
  </div>
</template>
