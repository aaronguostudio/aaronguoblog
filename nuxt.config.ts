import { seoData } from './data'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-09-30',

  runtimeConfig: {
    beehiivApiKey: process.env.BEEHIIV_API_KEY,
    beehiivPublicationId: process.env.BEEHIIV_PUBLICATION_ID,
  },

  css: ['~/assets/css/custom.css'],

  modules: [
    'nuxt-icon',
    '@nuxt/image',
    // Only include fonts module in development to avoid network errors during build
    ...(process.env.NODE_ENV === 'production' ? [] : ['@nuxt/fonts']),
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
      charset: 'utf-8',
      viewport: 'width=device-width,initial-scale=1',
      title: seoData.title,
      titleTemplate: `%s | Aaron Guo`,
      script: [
        {
          src: 'https://app.rybbit.io/api/script.js',
          'data-site-id': '82289e0e12a1',
          defer: true,
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  sitemap: {
    // Disable external sources during build to avoid network errors
    sources: process.env.NODE_ENV === 'production' ? [] : [seoData.mySite],
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
      ignore: ['/__og-image__'], // Ignore OG image generation during build
    },
  },

  ogImage: {
    // Disable OG image generation during build
    skipGeneration: process.env.NODE_ENV === 'production',
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'light',
  },

  image: {
    dir: 'public',
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
