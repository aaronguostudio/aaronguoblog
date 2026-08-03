import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const slug = 'document-visual-language'

const paths = {
  en: join(root, 'content', 'learn', 'en', `${slug}.md`),
  zh: join(root, 'content', 'learn', 'zh', `${slug}.md`),
  visual: join(root, 'components', 'learn', 'concepts', `${slug}.vue`),
  og: join(root, 'public', 'learn-img', slug, 'og-1200x627.jpg'),
  card: join(root, 'public', 'learn-img', slug, 'card-4x5.jpg'),
  theme: join(root, 'assets', 'css', 'tailwind.css'),
}

function readOrEmpty(filePath: string): string {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
}

function frontmatterValue(source: string, key: string): string | undefined {
  const match = source.match(new RegExp(`^${key}:\\s*['\"]?([^'\"\\n]+)['\"]?\\s*$`, 'm'))
  return match?.[1].trim()
}

function frontmatterList(source: string, key: string): string[] {
  const line = source.match(new RegExp(`^${key}:\\s*\\[(.+)\\]\\s*$`, 'm'))?.[1] || ''
  return [...line.matchAll(/['\"]([^'\"]+)['\"]/g)].map((match) => match[1])
}

function bodyWithoutFrontmatter(source: string): string {
  const sections = source.split(/^---\s*$/m)
  return sections.length >= 3 ? sections.slice(2).join('---').trim() : source.trim()
}

function cssBlock(source: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'))?.[1] || ''
}

function cssVariable(source: string, name: string): string | undefined {
  return source.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]
}

function relativeLuminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

interface DeclaredPalette {
  name: string
  paper: string
  muted: string
}

function declaredPresetPalettes(source: string): DeclaredPalette[] {
  const start = source.indexOf('const PRESET_SPECS')
  const end = source.indexOf('const COPY', start)
  if (start < 0 || end < 0) return []

  const presetSource = source.slice(start, end)
  const presetPattern = /^\s{2}([a-z][a-z0-9-]*):\s*\{([\s\S]*?)^\s{2}\},?$/gm
  const palettes: DeclaredPalette[] = []

  for (const match of presetSource.matchAll(presetPattern)) {
    const paper = match[2].match(/\bpaper:\s*['\"]#?([0-9a-f]{6})['\"]/i)?.[1]
    const muted = match[2].match(/\bmuted:\s*['\"]#?([0-9a-f]{6})['\"]/i)?.[1]
    if (paper && muted) palettes.push({ name: match[1], paper: `#${paper}`, muted: `#${muted}` })
  }

  return palettes
}

describe('Document Visual Language release candidate', () => {
  it('publishes a paired bilingual concept with the DVL interaction contract', () => {
    expect(existsSync(paths.en)).toBe(true)
    expect(existsSync(paths.zh)).toBe(true)
    expect(existsSync(paths.visual)).toBe(true)

    const en = readOrEmpty(paths.en)
    const zh = readOrEmpty(paths.zh)

    for (const source of [en, zh]) {
      expect(frontmatterValue(source, 'translationKey')).toBe(slug)
      expect(frontmatterValue(source, 'interaction')).toBe(slug)
      expect(frontmatterValue(source, 'published')).toBe('true')
    }

    expect(frontmatterList(en, 'tags').length).toBeGreaterThan(0)
    expect(frontmatterList(zh, 'tags').length).toBeGreaterThan(0)
    expect([...en.matchAll(/^\s+url:\s*['\"]([^'\"]+)['\"]\s*$/gm)].map((match) => match[1])).toEqual(
      [...zh.matchAll(/^\s+url:\s*['\"]([^'\"]+)['\"]\s*$/gm)].map((match) => match[1]),
    )
  })

  it('ships dedicated Open Graph and portrait card metadata with the actual assets', () => {
    const expectedOg = `/learn-img/${slug}/og-1200x627.jpg`
    const expectedCard = `/learn-img/${slug}/card-4x5.jpg`
    const en = readOrEmpty(paths.en)
    const zh = readOrEmpty(paths.zh)

    for (const source of [en, zh]) {
      expect(frontmatterValue(source, 'socialImage')).toBe(expectedOg)
      expect(frontmatterValue(source, 'cardImage')).toBe(expectedCard)
      expect(frontmatterValue(source, 'socialImageAlt')?.length || 0).toBeGreaterThan(20)
      expect(frontmatterValue(source, 'cardImageAlt')?.length || 0).toBeGreaterThan(20)
    }

    expect(frontmatterValue(en, 'socialImageAlt')).not.toBe(frontmatterValue(zh, 'socialImageAlt'))
    expect(frontmatterValue(en, 'cardImageAlt')).not.toBe(frontmatterValue(zh, 'cardImageAlt'))
    expect(existsSync(paths.og)).toBe(true)
    expect(existsSync(paths.card)).toBe(true)
  })

  it('leaves the page-level H1 to the Learn detail shell', () => {
    for (const filePath of [paths.en, paths.zh]) {
      const body = bodyWithoutFrontmatter(readOrEmpty(filePath))
      expect(body).not.toMatch(/^#\s+/m)
      expect(body).toMatch(/^##\s+/m)
    }
  })

  it('exposes exactly four continuously adjustable axes with accessible labels', () => {
    const visual = readOrEmpty(paths.visual)
    const axisDeclaration = visual.match(/const axisKeys:\s*AxisKey\[\]\s*=\s*\[([^\]]+)\]/)?.[1] || ''
    const axes = [...axisDeclaration.matchAll(/['\"]([^'\"]+)['\"]/g)].map((match) => match[1])

    expect(axes).toEqual(['temperature', 'geometry', 'density', 'expression'])
    expect(visual).toMatch(
      /<label\s+v-for="axis in axisKeys"[\s\S]*?\{\{\s*copy\.axes\[axis\]\.label\s*\}\}[\s\S]*?<input[\s\S]*?type="range"[\s\S]*?<\/label>/,
    )
    expect(visual).toContain(`:id="'dvl-' + axis"`)
    expect(visual).toContain(`:for="'dvl-' + axis"`)
  })

  it('offers explicit controls for exporting a Visual Language Brief and JSON', () => {
    const visual = readOrEmpty(paths.visual)
    const buttonTags = visual.match(/<button\b[^>]*>/g) || []

    for (const format of ['brief', 'json']) {
      const control = buttonTags.find((tag) =>
        new RegExp(`data-dvl-export=['\"]${format}['\"]`).test(tag),
      )
      expect(control, `Missing ${format} export control`).toBeDefined()
      expect(control).toContain('type="button"')
      expect(control).toMatch(/@click=/)
    }

    expect(visual).toMatch(/Visual Language Brief/i)
    expect(visual).toMatch(/JSON/i)
  })

  it('contains wide interactive regions inside the viewport at mobile widths', () => {
    const visual = readOrEmpty(paths.visual)
    const style = visual.match(/<style scoped>([\s\S]*?)<\/style>/)?.[1] || ''

    expect(style).not.toMatch(/(?:^|[;{]\s*)(?:width|min-width):\s*(?:[6-9]\d{2}|[1-9]\d{3,})px/i)
    expect(style).toMatch(/\.preview-stage\s*\{[^}]*min-width:\s*0/i)
    expect(style).toMatch(
      /@media\s*\(max-width:\s*1000px\)[\s\S]*?\.lab-workspace\s*\{[^}]*grid-template-columns:\s*1fr/i,
    )
    expect(style).toMatch(
      /@media\s*\(max-width:\s*560px\)[\s\S]*?\.preset-grid\s*\{[^}]*overflow-x:\s*auto/i,
    )
  })

  it('keeps every preset muted-text color readable on its paper color', () => {
    const palettes = declaredPresetPalettes(readOrEmpty(paths.visual))
    expect(palettes).toHaveLength(12)

    const failures = palettes
      .map((palette) => ({
        name: palette.name,
        ratio: contrastRatio(palette.muted, palette.paper),
      }))
      .filter(({ ratio }) => ratio < 4.5)
      .map(({ name, ratio }) => `${name}: ${ratio.toFixed(2)}:1`)

    expect(failures, `Preset contrast below 4.5:1: ${failures.join(', ')}`).toEqual([])
  })

  it('uses theme-specific DVL annotation colors that remain readable in light and dark cards', () => {
    const visual = readOrEmpty(paths.visual)
    const theme = readOrEmpty(paths.theme)
    const lightTheme = cssBlock(theme, ':root')
    const darkTheme = cssBlock(theme, '.dark')
    const visualTheme = cssBlock(visual, '.dvl-visual')
    const darkVisualTheme =
      cssBlock(visual, '.dark .dvl-visual') || cssBlock(visual, ':global(.dark) .dvl-visual')

    const lightAnnotation = cssVariable(visualTheme, '--dvl-blue')
    const darkAnnotation = cssVariable(darkVisualTheme, '--dvl-blue') || lightAnnotation
    const checks = [
      ['light card', lightAnnotation, cssVariable(lightTheme, '--card')],
      ['light secondary', lightAnnotation, cssVariable(lightTheme, '--secondary')],
      ['dark card', darkAnnotation, cssVariable(darkTheme, '--card')],
      ['dark secondary', darkAnnotation, cssVariable(darkTheme, '--secondary')],
    ] as const

    const missingColors = checks.filter(([, foreground, background]) => !foreground || !background)
    expect(missingColors).toEqual([])

    const failures = checks
      .filter((check): check is readonly [string, string, string] => Boolean(check[1] && check[2]))
      .map(([surface, foreground, background]) => ({
        surface,
        ratio: contrastRatio(foreground, background),
      }))
      .filter(({ ratio }) => ratio < 4.5)
      .map(({ surface, ratio }) => `${surface}: ${ratio.toFixed(2)}:1`)

    expect(failures, `DVL annotation contrast below 4.5:1: ${failures.join(', ')}`).toEqual([])
  })
})
