import { seoData } from './data'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-09-30',

  css: ['~/assets/css/custom.css'],

  modules: [
    'nuxt-icon',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-og-image',
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@formkit/auto-animate',
    '@stefanobartoletti/nuxt-social-share',
    '@nuxtjs/i18n',
  ],

  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width,initial-scale=1',
      title: seoData.title,
      titleTemplate: `%s - ${seoData.title}`,
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  sitemap: {
    sources: [seoData.mySite],
  },

  site: {
    url: seoData.mySite,
    name: 'Aaron Guo',
  },

  typescript: {
    strict: true,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/rss.xml'],
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'light',
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'dracula',
        },
      },
    },
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          sanitizeFileName: true,
        },
      },
    },
  },

  i18n: {
    locales: [
      // Define your supported languages
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en-US.json', // Specify translation file
      },
      {
        code: 'zh',
        iso: 'zh-CN',
        name: '简体中文',
        file: 'zh-CN.json', // Specify translation file
      },
      // Add more locales as needed
    ],
    lazy: true, // Lazy load translation files
    langDir: 'locales', // Directory where translation files will be stored
    defaultLocale: 'en', // Your default language
    strategy: 'prefix_except_default', // Routing strategy (e.g., /about, /zh/about)
  },
})
