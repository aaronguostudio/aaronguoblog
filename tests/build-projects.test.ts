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
  it('publishes Tesra in both locales with accurate public positioning', () => {
    const english = readProject('en', 'tesra')
    const chinese = readProject('zh', 'tesra')

    expect(english).toContain('title: Tesra')
    expect(english).toContain(
      'description: A curated AI-native visual library for campaign-ready image systems.',
    )
    expect(english).toContain('published: true')
    expect(english).toContain('featured: true')
    expect(english).toContain("tech: ['Next.js', 'Supabase', 'OpenAI', 'Vercel']")
    expect(english).toContain('logo: /projects/tesra/tesra-mark.png')
    expect(english).toContain('  - /projects/tesra/tesra-signal-horizon.png')
    expect(english).toContain('demo: https://tesra.art')

    expect(chinese).toContain('title: Tesra')
    expect(chinese).toContain('published: true')
    expect(chinese).toContain('featured: true')
    expect(chinese).toContain("tech: ['Next.js', 'Supabase', 'OpenAI', 'Vercel']")
    expect(chinese).not.toContain('ImageDock')
    expect(english).not.toContain('Testra')
  })

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

  it('publishes DrumNext in both locales with its public practice-workspace positioning', () => {
    const english = readProject('en', 'drum-next')
    const chinese = readProject('zh', 'drum-next')

    expect(english).toContain('title: DrumNext')
    expect(english).toContain(
      'description: A local-first drum practice workspace for building rhythm, tracking habits, and keeping session tools close.',
    )
    expect(english).toContain('published: true')
    expect(english).toContain('order: 30')
    expect(english).toContain('layout: copy-media')
    expect(english).toContain('tone: drumnext')
    expect(english).toContain(
      "tech: ['React', 'TypeScript', 'Vite', 'Supabase', 'Web MIDI']",
    )
    expect(english).toContain('logo: /projects/drum-next/drum-next-mark.png')
    expect(english).toContain(
      '  - /projects/drum-next/drum-next-timing-lab.png',
    )
    expect(english).toContain('demo: https://www.drumnext.com')

    expect(chinese).toContain('title: DrumNext')
    expect(chinese).toContain('published: true')
    expect(chinese).toContain('order: 30')
    expect(chinese).toContain('layout: copy-media')
    expect(chinese).toContain('tone: drumnext')
    expect(chinese).toContain('demo: https://www.drumnext.com')
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

  it('ships Tesra project assets inside the blog repository', () => {
    expect(
      existsSync(join(root, 'public', 'projects', 'tesra', 'tesra-mark.png')),
    ).toBe(true)
    expect(
      existsSync(join(root, 'public', 'projects', 'tesra', 'tesra-signal-horizon.png')),
    ).toBe(true)
  })

  it('ships DrumNext project assets inside the blog repository', () => {
    expect(
      existsSync(join(root, 'public', 'projects', 'drum-next', 'drum-next-mark.png')),
    ).toBe(true)
    expect(
      existsSync(
        join(root, 'public', 'projects', 'drum-next', 'drum-next-timing-lab.png'),
      ),
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

  it('uses a featured-first, alternating project dossier layout without status badges', () => {
    const buildPage = readFileSync(join(root, 'pages', 'build.vue'), 'utf8')

    expect(buildPage).toContain('featured?: boolean')
    expect(buildPage).toContain('const featured = Boolean(meta?.featured ?? root?.featured ?? false)')
    expect(buildPage).toContain('featured,')
    expect(buildPage).toMatch(
      /a\.featured !== b\.featured[\s\S]*?return a\.featured \? -1 : 1/,
    )
    expect(buildPage).toContain('build-project-list')
    expect(buildPage).toContain('build-project-dossier')
    expect(buildPage).toContain("layout?: 'copy-media' | 'media-copy'")
    expect(buildPage).toContain('build-project-dossier--copy-media')
    expect(buildPage).toContain('build-project-dossier--media-copy')
    expect(buildPage).toContain("project.layout === 'copy-media'")
    expect(buildPage).toContain("project.layout === 'media-copy'")
    expect(buildPage).toContain('build-project-media')
    expect(buildPage).toContain('build-project-copy')
    expect(buildPage).toMatch(/\.build-project-list\s*\{[\s\S]*?gap:\s*clamp\(/)
    expect(buildPage).toMatch(/\.build-project-dossier\s*\{[\s\S]*?grid-template-columns:/)
    expect(buildPage).toMatch(/\.build-project-dossier--media-copy\s*\.build-project-media\s*\{[\s\S]*?translateY/)
    expect(buildPage).not.toContain("t('build.shipped')")
    expect(buildPage).not.toContain("t('build.building')")
    expect(buildPage).not.toContain('animate-ping')
    expect(buildPage).not.toMatch(/>\s*(?:live|shipped)\s*</i)
    expect(buildPage).toContain('project.screenshots?.[0]')
    expect(buildPage).toContain('v-if="project.demo"')
    expect(buildPage).toContain(':href="project.demo"')
    expect(buildPage).toContain('v-if="project.release"')
    expect(buildPage).toContain(':href="project.release"')
    expect(buildPage).toContain('target="_blank"')
    expect(buildPage).toContain('rel="noopener noreferrer"')
  })

  it('keeps the Build intro compact and separates mobile project dossiers', () => {
    const buildPage = readFileSync(join(root, 'pages', 'build.vue'), 'utf8')

    expect(buildPage).toContain('padding-top: clamp(2.75rem, 4vw, 4.25rem);')
    expect(buildPage).toContain('padding-bottom: clamp(1.75rem, 2.75vw, 2.75rem);')
    expect(buildPage).not.toContain('padding-top: clamp(4rem, 7vw, 6.5rem);')
    expect(buildPage).toContain('padding-block: clamp(2.25rem, 3.5vw, 3.25rem);')
    expect(buildPage).toMatch(
      /@media \(max-width: 1023px\) \{[\s\S]*?\.build-project-list\s*\{[\s\S]*?gap:\s*0;[\s\S]*?padding-block:\s*0;/,
    )
    expect(buildPage).toContain('.build-project + .build-project')
    expect(buildPage).toContain('border-top: 1px solid var(--build-line-strong);')
    expect(buildPage).toContain('padding-block: 1.25rem 1.75rem;')
    expect(buildPage).toMatch(
      /@media \(max-width: 1023px\) \{[\s\S]*?\.build-project-dossier\s*\{[\s\S]*?gap:\s*0\.875rem;/,
    )
    expect(buildPage).toContain('.build-project-copy > .mt-9')
    expect(buildPage).toContain('margin-top: 1.5rem;')
  })
})
