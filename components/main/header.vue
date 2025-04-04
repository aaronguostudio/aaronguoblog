<script setup lang="ts">
import { navbarData } from '../../data'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const localePath = useLocalePath()

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

// Helper function to update locale (optional but good practice)
function changeLocale(event: Event) {
  const target = event.target as HTMLSelectElement
  // Assert the type to satisfy setLocale's expectation
  setLocale(target.value as 'en' | 'zh') // <-- Adjust 'en' | 'zh' if you have different locale codes
}
</script>

<template>
  <div class="py-5 border-b dark:border-gray-800 font-semibold">
    <div class="flex px-6 container max-w-5xl justify-between mx-auto items-baseline">
      <ul class="flex items-baseline space-x-5">
        <li class="text-base sm:text-2xl font-bold">
          <NuxtLink to="/" :class="{ underline: $route.path === '/' }">
            {{ navbarData.homeTitle }}
          </NuxtLink>
        </li>
      </ul>
      <ul class="flex items-center space-x-3 sm:space-x-6 text-sm sm:text-lg">
        <li>
          <NuxtLink :to="localePath('/blogs')" :class="{ underline: isActive('/blogs') }">
            Blogs
          </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="localePath('/categories')" :class="{ underline: isActive('/categories') }">
            Categories
          </NuxtLink>
        </li>
        <li title="About Me">
          <NuxtLink
            :to="localePath('/about')"
            aria-label="About me"
            :class="{ underline: $route.path === '/about' }"
          >
            About
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
        <!-- Add Language Switcher Dropdown -->
        <li title="Change Language">
          <select
            v-model="locale"
            class="bg-transparent dark:bg-slate-950 pl-3 pr-8 py-1 rounded-md hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
            aria-label="Change Language"
            @change="changeLocale"
          >
            <option
              v-for="loc in availableLocales"
              :key="loc.code"
              :value="loc.code"
              class="dark:bg-slate-800"
            >
              {{ loc.name || loc.code }}
              <!-- Display name or code -->
            </option>
          </select>
        </li>
      </ul>
    </div>
  </div>
</template>
