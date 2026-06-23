import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function readProject(locale: 'en' | 'zh', slug: string) {
  return readFileSync(
    join(root, 'content', 'projects', locale, `${slug}.md`),
    'utf8',
  )
}

describe('Build projects content', () => {
  it('publishes Asset Bento in both locales', () => {
    const english = readProject('en', 'asset-bento')
    const chinese = readProject('zh', 'asset-bento')

    expect(english).toContain('title: Asset Bento')
    expect(english).toContain('published: true')
    expect(english).toContain('status: shipped')
    expect(english).toContain(
      'github: https://github.com/aaronguostudio/asset-bento',
    )
    expect(english).toContain(
      'release: https://github.com/aaronguostudio/asset-bento/releases/tag/v0.1.0',
    )

    expect(chinese).toContain('title: Asset Bento')
    expect(chinese).toContain('published: true')
    expect(chinese).toContain('status: shipped')
    expect(chinese).toContain(
      'github: https://github.com/aaronguostudio/asset-bento',
    )
    expect(chinese).toContain(
      'release: https://github.com/aaronguostudio/asset-bento/releases/tag/v0.1.0',
    )
  })

  it('keeps ClawMemory hidden from the public Build page', () => {
    expect(readProject('en', 'clawmemory')).toContain('published: false')
    expect(readProject('zh', 'clawmemory')).toContain('published: false')
  })

  it('ships the Asset Bento banner used by the Build page', () => {
    expect(
      existsSync(join(root, 'public', 'builds', 'asset-bento-readme-banner.png')),
    ).toBe(true)
  })

  it('uses audience-facing project tags for Asset Bento', () => {
    const english = readProject('en', 'asset-bento')
    const chinese = readProject('zh', 'asset-bento')

    expect(english).toContain(
      "tech: ['TypeScript', 'Skills', 'Claude Code', 'Web Assets']",
    )
    expect(chinese).toContain(
      "tech: ['TypeScript', 'Skills', 'Claude Code', 'Web Assets']",
    )
    expect(english).not.toContain('OpenAI Images')
    expect(english).not.toContain('Sharp')
  })

  it('renders release links on project cards', () => {
    const buildPage = readFileSync(join(root, 'pages', 'build.vue'), 'utf8')

    expect(buildPage).toContain('release?: string')
    expect(buildPage).toContain('project.release')
    expect(buildPage).toContain("t('build.viewRelease')")
  })

  it('filters unpublished projects in every environment', () => {
    const buildPage = readFileSync(join(root, 'pages', 'build.vue'), 'utf8')

    expect(buildPage).toContain('projectsEn.filter(isPublishedEntry)')
    expect(buildPage).toContain('projectsZh.filter(isPublishedEntry)')
    expect(buildPage).toContain('mapped.filter((p) => p.published)')
    expect(buildPage).not.toContain('process.env.NODE_ENV')
  })

  it('uses the full-width project banner above the card content', () => {
    const buildPage = readFileSync(join(root, 'pages', 'build.vue'), 'utf8')

    expect(buildPage).toContain('build-featured-preview')
    expect(buildPage).toContain('border-b border-border')
    expect(buildPage).toContain('project.screenshots?.[0]')
    expect(buildPage).toContain('h-16 w-16')
    expect(buildPage).toContain('object-contain')
    expect(buildPage).not.toContain('lg:object-cover')
    expect(buildPage).not.toContain('lg:grid-cols-[minmax(0,1fr)_minmax(380px,560px)]')
    expect(buildPage).not.toContain('sm:grid-cols-3')
  })
})
