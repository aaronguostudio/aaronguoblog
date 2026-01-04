/**
 * Type guard utilities for safer type checking
 */
import type { BlogPost } from '~/types/blog'

/**
 * Check if an object is a BlogPost
 * @param obj - The object to check
 * @returns True if the object is a BlogPost
 */
export function isBlogPost(obj: unknown): obj is BlogPost {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'title' in obj &&
    'date' in obj &&
    'description' in obj &&
    'tags' in obj &&
    'published' in obj
  )
}

/**
 * Safely cast an unknown object to BlogPost
 * @param obj - The object to cast
 * @returns The object as BlogPost or a default BlogPost
 */
export function toBlogPost(obj: unknown): BlogPost {
  if (isBlogPost(obj)) {
    return obj
  }

  // Return a default BlogPost if the object is not a valid BlogPost
  return {
    title: 'Untitled',
    date: new Date().toISOString(),
    description: 'No description available',
    image: '/not-found.jpg',
    alt: 'No image description available',
    ogImage: '/not-found.jpg',
    tags: [],
    published: false,
  }
}

/**
 * Extract BlogPost metadata from content
 * @param content - The content object from Nuxt Content
 * @returns The BlogPost metadata
 */
export function extractBlogPostMeta(content: {
  title?: string
  description?: string
  meta?: Partial<BlogPost>
}): BlogPost {
  if (!content) {
    return toBlogPost({})
  }

  // Extract metadata from content
  const meta = content.meta || {}

  return {
    title: content.title || 'Untitled',
    description: content.description || 'No description available',
    date: meta.date || new Date().toISOString(),
    image: meta.image || '/not-found.jpg',
    alt: meta.alt || 'No image description available',
    ogImage: meta.ogImage || '/not-found.jpg',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    topics: Array.isArray(meta.topics) ? meta.topics : [],
    published: Boolean(meta.published),
    featured: Boolean(meta.featured),
  }
}
