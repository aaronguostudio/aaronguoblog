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
 * Determine if the current route is a Chinese route
 */
const isChineseRoute = computed(() => {
  return route.path.startsWith('/zh/') || route.path === '/zh'
})

/**
 * Watch for route changes and update locale if needed
 * This ensures the i18n state stays in sync with the route
 */
watch(
  isChineseRoute,
  (isChinese) => {
    if (isChinese && locale.value !== 'zh') {
      locale.value = 'zh'
    } else if (!isChinese && locale.value !== 'en') {
      locale.value = 'en'
    }
  },
  { immediate: true },
)

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

        <!-- Language Switcher -->
        <div
          class="flex items-center space-x-1 border-l border-border pl-6"
          title="Change Language"
        >
          <NuxtLink
            :to="switchLocalePath('en')"
            class="px-2 py-1 text-sm font-medium rounded-md transition-all"
            :class="
              !isChineseRoute
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
            "
            aria-label="Switch to English"
          >
            EN
          </NuxtLink>
          <NuxtLink
            :to="switchLocalePath('zh')"
            class="px-2 py-1 text-sm font-medium rounded-md transition-all"
            :class="
              isChineseRoute
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
            "
            aria-label="Switch to Chinese"
          >
            中
          </NuxtLink>
        </div>

        <!-- Theme Toggle -->
        <div class="flex items-center">
          <ClientOnly>
            <button
              aria-label="Toggle dark mode"
              class="px-1 py-1 rounded-md hover:bg-secondary transition-colors"
              @click="toggleColorMode"
            >
              <Icon
                :name="colorMode.value === 'dark' ? 'heroicons:sun' : 'heroicons:moon'"
                class="w-4 h-4"
              />
            </button>
            <template #fallback>
              <div class="w-4 h-4"></div>
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
          <!-- Language Switcher -->
          <div class="flex items-center space-x-2" title="Change Language">
            <span class="text-sm text-foreground/70">{{ t('navigation.language') }}:</span>
            <div class="flex space-x-1">
              <NuxtLink
                :to="switchLocalePath('en')"
                class="px-2 py-1 text-sm font-medium rounded-md transition-all"
                :class="
                  !isChineseRoute
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                "
                @click="isMobileMenuOpen = false"
              >
                EN
              </NuxtLink>
              <NuxtLink
                :to="switchLocalePath('zh')"
                class="px-2 py-1 text-sm font-medium rounded-md transition-all"
                :class="
                  isChineseRoute
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                "
                @click="isMobileMenuOpen = false"
              >
                中
              </NuxtLink>
            </div>
          </div>

          <!-- Theme Toggle -->
          <div class="flex items-center">
            <ClientOnly>
              <button
                aria-label="Toggle dark mode"
                class="p-2 rounded-md hover:bg-secondary transition-colors"
                @click="toggleColorMode"
              >
                <Icon
                  :name="colorMode.value === 'dark' ? 'heroicons:sun' : 'heroicons:moon'"
                  class="w-4 h-4"
                />
              </button>
            </ClientOnly>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>
