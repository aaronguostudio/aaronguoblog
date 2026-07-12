import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const blogDetailPages = [
  'pages/blogs/[blog].vue',
  'pages/blogs/[...blog].vue',
]

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
})
