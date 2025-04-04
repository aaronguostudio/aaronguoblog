import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asRobotsCollection } from '@nuxtjs/robots/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'
import { asOgImageCollection } from 'nuxt-og-image/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      ...asRobotsCollection({
        type: 'page',
        source: '**/*.md',
      }),
      ...asSitemapCollection({
        type: 'page',
        source: '**/*.md',
      }),
      ...asOgImageCollection({
        type: 'page',
        source: '**/*.md',
      }),
    }),
    en: defineCollection({
      ...asRobotsCollection({
        type: 'page',
        source: 'blogs/en/*.md',
      }),
      ...asSitemapCollection({
        type: 'page',
        source: 'blogs/en/*.md',
      }),
      ...asOgImageCollection({
        type: 'page',
        source: 'blogs/en/*.md',
      }),
    }),
    zh: defineCollection({
      ...asRobotsCollection({
        type: 'page',
        source: 'blogs/zh/*.md',
      }),
      ...asSitemapCollection({
        type: 'page',
        source: 'blogs/zh/*.md',
      }),
      ...asOgImageCollection({
        type: 'page',
        source: 'blogs/zh/*.md',
      }),
    }),
  },
})
