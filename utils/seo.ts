/**
 * SEO utilities for consistent metadata across the site
 */
import { siteDescription } from '~/app/content'

// Site configuration
const siteConfig = {
  name: 'Aaron Guo',
  url: 'https://www.aaronguo.com',
  description: siteDescription,
  defaultImage: '/og-image.jpg',
  twitterHandle: '@aaronguostudio',
}

/**
 * SEO options interface
 */
export interface SeoOptions {
  title: string
  description?: string
  image?: string
  imageAlt?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  locale?: string
}

/**
 * Generate SEO metadata for a page
 * @param options - SEO options
 * @returns SEO metadata
 */
export function useSeo(options: SeoOptions) {
  const {
    title,
    description = siteConfig.description,
    image = siteConfig.defaultImage,
    imageAlt = title,
    url = siteConfig.url,
    type = 'website',
    publishedTime,
    modifiedTime,
    tags,
    locale = 'en',
  } = options

  // Full URL for the image
  const fullImageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`

  // Full URL for the page
  const fullUrl = url.startsWith('http') ? url : `${siteConfig.url}${url}`

  // Title with site name
  // const fullTitle = `${title} - ${siteConfig.name}`

  // Generate metadata
  useHead({
    title,
    titleTemplate: `%s - ${siteConfig.name}`,
    meta: [
      // Basic metadata
      { name: 'description', content: description },

      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: fullImageUrl },
      { property: 'og:image:alt', content: imageAlt },
      { property: 'og:url', content: fullUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:locale', content: locale },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: siteConfig.twitterHandle },
      { name: 'twitter:url', content: fullUrl },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: fullImageUrl },
      { name: 'twitter:image:alt', content: imageAlt },

      // Article specific metadata
      ...(type === 'article' && publishedTime
        ? [{ property: 'article:published_time', content: publishedTime }]
        : []),
      ...(type === 'article' && modifiedTime
        ? [{ property: 'article:modified_time', content: modifiedTime }]
        : []),
      ...(type === 'article' && tags
        ? tags.map((tag) => ({ property: 'article:tag', content: tag }))
        : []),
    ],
    link: [{ rel: 'canonical', href: fullUrl }],
  })
}
