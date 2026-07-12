import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asRobotsCollection } from '@nuxtjs/robots/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'
import { asOgImageCollection } from 'nuxt-og-image/content'

const noteSchema = z.object({
  date: z.string(),
  summary: z.string(),
  hook: z.string(),
  image: z.string().optional(),
  socialImage: z.string().optional(),
  alt: z.string().optional(),
  topics: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  number: z.number().int().positive().optional(),
  translationKey: z.string().optional(),
})

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
    projectsEn: defineCollection({
      source: 'projects/en/*.md',
    }),
    projectsZh: defineCollection({
      source: 'projects/zh/*.md',
    }),
    notesEn: defineCollection(
      asRobotsCollection(
        asSitemapCollection(
          asOgImageCollection({
            type: 'page',
            source: { include: 'notes/en/*.md', prefix: '/notes' },
            schema: noteSchema,
          }),
        ),
      ),
    ),
    notesZh: defineCollection(
      asRobotsCollection(
        asSitemapCollection(
          asOgImageCollection({
            type: 'page',
            source: { include: 'notes/zh/*.md', prefix: '/zh/notes' },
            schema: noteSchema,
          }),
        ),
      ),
    ),
  },
})
