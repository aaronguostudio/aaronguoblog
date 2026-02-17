<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * Internationalization setup
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

/**
 * Sync the i18n_redirected cookie with the current locale.
 * The @nuxtjs/i18n module reads this cookie on page load to determine the redirect target.
 * Without this sync, the cookie can get stuck on a stale value (e.g. 'zh')
 * even after the user switches to English.
 */
const i18nCookie = useCookie('i18n_redirected')
watch(
  locale,
  (newLocale) => {
    if (i18nCookie.value !== newLocale) {
      i18nCookie.value = newLocale
    }
  },
  { immediate: true },
)

/**
 * Whether the current locale is Chinese.
 * Uses locale.value from @nuxtjs/i18n as the source of truth — the module
 * correctly resolves the locale from the URL during both SSR and client hydration.
 */
const isChinese = computed(() => locale.value === 'zh')

/**
 * Color mode toggle
 */
const colorMode = useColorMode()
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

/**
 * Mobile menu state
 */
const isMobileMenuOpen = ref(false)
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

/**
 * Navigation items - computed to be reactive to language changes
 */
const navItems = computed(() => [
  { name: t('navigation.home'), path: '/', exact: true },
  { name: t('navigation.blogs'), path: '/blogs', exact: false },
  { name: t('navigation.about'), path: '/about', exact: false },
])

/**
 * Active route detection
 */
function isActive(path: string, exact = false) {
  // Handle both localized and non-localized paths
  const currentPath = route.path

  if (exact) {
    return currentPath === path || currentPath === `/${locale.value}`
  }

  return (
    currentPath === path ||
    currentPath.startsWith(`/${locale.value}${path}`) ||
    currentPath.startsWith(path)
  )
}
</script>

<template>
  <header class="py-4 sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
    <div class="flex items-center px-4 container max-w-8xl justify-between mx-auto">
      <!-- Logo/Site Title -->
      <div class="flex items-baseline">
        <NuxtLink
          :to="localePath('/')"
          class="text-base sm:text-2xl font-bold hover:text-primary transition-colors"
        >
          {{ t('navigation.homeTitle') }}
        </NuxtLink>
      </div>

      <!-- Mobile menu button -->
      <button
        class="md:hidden p-2 rounded-md hover:bg-secondary"
        aria-label="Toggle menu"
        @click="toggleMobileMenu"
      >
        <Icon :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-6 h-6" />
      </button>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-6">
        <!-- Navigation Links -->
        <ul class="flex items-center space-x-6 text-sm sm:text-base">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="localePath(item.path)"
              :class="[
                'py-2 transition-colors hover:text-primary',
                isActive(item.path, item.exact) ? 'text-primary font-medium' : 'text-foreground/70',
              ]"
            >
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>

        <!-- Language & Theme Toggle Pill -->
        <div class="flex items-center rounded-full bg-secondary p-0.5 gap-0.5">
          <NuxtLink
            :to="switchLocalePath('en')"
            class="px-2.5 py-1 text-xs font-medium rounded-full transition-all"
            :class="
              !isChinese
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            aria-label="Switch to English"
          >
            EN
          </NuxtLink>
          <NuxtLink
            :to="switchLocalePath('zh')"
            class="px-2.5 py-1 text-xs font-medium rounded-full transition-all"
            :class="
              isChinese
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            aria-label="Switch to Chinese"
          >
            中
          </NuxtLink>
          <div class="w-px h-3.5 bg-border" />
          <ClientOnly>
            <button
              aria-label="Toggle dark mode"
              class="px-2 py-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              @click="toggleColorMode"
            >
              <Icon
                :name="colorMode.value === 'dark' ? 'heroicons:sun' : 'heroicons:moon'"
                class="w-3.5 h-3.5"
              />
            </button>
            <template #fallback>
              <div class="w-3.5 h-3.5 px-2 py-1"></div>
            </template>
          </ClientOnly>
        </div>
      </nav>
    </div>

    <!-- Mobile Navigation Menu -->
    <div v-show="isMobileMenuOpen" class="md:hidden border-t border-border">
      <nav class="container max-w-8xl mx-auto px-4 py-4 flex flex-col space-y-4">
        <ul class="flex flex-col space-y-3">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="localePath(item.path)"
              :class="[
                'block py-2 transition-colors hover:text-primary',
                isActive(item.path, item.exact) ? 'text-primary font-medium' : 'text-foreground/70',
              ]"
              @click="isMobileMenuOpen = false"
            >
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>

        <div class="flex items-center justify-between pt-4 border-t border-border">
          <!-- Language & Theme Toggle Pill -->
          <div class="flex items-center rounded-full bg-secondary p-0.5 gap-0.5">
            <NuxtLink
              :to="switchLocalePath('en')"
              class="px-3 py-1.5 text-xs font-medium rounded-full transition-all"
              :class="
                !isChinese
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="isMobileMenuOpen = false"
            >
              EN
            </NuxtLink>
            <NuxtLink
              :to="switchLocalePath('zh')"
              class="px-3 py-1.5 text-xs font-medium rounded-full transition-all"
              :class="
                isChinese
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="isMobileMenuOpen = false"
            >
              中
            </NuxtLink>
            <div class="w-px h-3.5 bg-border" />
            <ClientOnly>
              <button
                aria-label="Toggle dark mode"
                class="px-2 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                @click="toggleColorMode"
              >
                <Icon
                  :name="colorMode.value === 'dark' ? 'heroicons:sun' : 'heroicons:moon'"
                  class="w-3.5 h-3.5"
                />
              </button>
            </ClientOnly>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>
