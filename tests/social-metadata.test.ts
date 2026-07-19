import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const blogDetailPages = [
  'pages/blogs/[blog].vue',
  'pages/blogs/[...blog].vue',
]
const notePage = 'pages/notes/[slug].vue'
const learnPage = 'pages/learn/[slug].vue'

describe('blog social metadata', () => {
  it('uses absolute static social images instead of runtime OG image generation', () => {
    for (const relativePath of blogDetailPages) {
      const source = readFileSync(join(root, relativePath), 'utf8')

      expect(source).toContain('const canonicalUrl = computed')
      expect(source).toContain('const socialImageUrl = computed')
      expect(source).toContain("new URL(data.value.ogImage || data.value.image || '/blogs-img/blog.jpg', seoData.mySite)")
      expect(source).toContain('content: socialImageUrl.value')
      expect(source).not.toContain('defineOgImageComponent')
    }
  })

  it('ships a Facebook-safe static JPEG for the FDE article', () => {
    const article = readFileSync(
      join(root, 'content/blogs/en/28.why-ai-companies-are-becoming-deployment-companies.md'),
      'utf8',
    )
    const socialImage = 'public/blogs-img/2026-07-06-fde-ai-social.jpg'

    expect(article).toContain('ogImage: /blogs-img/2026-07-06-fde-ai-social.jpg')
    expect(existsSync(join(root, socialImage))).toBe(true)
  })

  it('uses the note social image instead of runtime OG image generation', () => {
    const source = readFileSync(join(root, notePage), 'utf8')
    const englishNote = readFileSync(
      join(root, 'content/notes/en/rest-is-part-of-the-ai-stack.md'),
      'utf8',
    )
    const chineseNote = readFileSync(
      join(root, 'content/notes/zh/rest-is-part-of-the-ai-stack.md'),
      'utf8',
    )
    const socialImage = 'public/notes-img/rest-is-part-of-the-ai-stack-social.jpg'

    expect(source).toContain("note.value?.socialImage || note.value?.image || '/og-image.jpg'")
    expect(source).toContain('image: socialImage.value')
    expect(source).not.toContain('defineOgImageComponent')
    expect(englishNote).toContain('socialImage: \'/notes-img/rest-is-part-of-the-ai-stack-social.jpg\'')
    expect(chineseNote).toContain('socialImage: \'/notes-img/rest-is-part-of-the-ai-stack-social.jpg\'')
    expect(existsSync(join(root, socialImage))).toBe(true)
  })

  it('uses a static Learn social image instead of runtime OG image generation', () => {
    const source = readFileSync(join(root, learnPage), 'utf8')
    const englishConcept = readFileSync(
      join(root, 'content/learn/en/optimistic-concurrency.md'),
      'utf8',
    )
    const chineseConcept = readFileSync(
      join(root, 'content/learn/zh/optimistic-concurrency.md'),
      'utf8',
    )
    const socialImage = 'public/learn-img/optimistic-concurrency/og-1200x627.jpg'

    expect(source).toContain("image: concept.value.socialImage || '/og-image.jpg'")
    expect(source).toContain('imageAlt: concept.value.socialImageAlt || concept.value.title')
    expect(source).not.toContain('defineOgImageComponent')
    expect(englishConcept).toContain(
      'socialImage: "/learn-img/optimistic-concurrency/og-1200x627.jpg"',
    )
    expect(chineseConcept).toContain(
      'socialImage: "/learn-img/optimistic-concurrency/og-1200x627.jpg"',
    )
    expect(existsSync(join(root, socialImage))).toBe(true)
  })

  it('sets a page-specific Twitter URL and image alt text', () => {
    const source = readFileSync(join(root, 'utils/seo.ts'), 'utf8')

    expect(source).toContain("{ name: 'twitter:url', content: fullUrl }")
    expect(source).toContain("{ name: 'twitter:image:alt', content: imageAlt }")
  })
})
