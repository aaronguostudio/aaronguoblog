import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { filterLearn, getLearnRoute, getLearnSlug, prepareLearn } from '../utils/learn'

const root = process.cwd()

const base = {
  title: 'Optimistic Concurrency',
  fullName: 'Optimistic Concurrency Control',
  shortName: 'OCC',
  description: 'Description',
  mentalModel: 'Validate assumptions at write time.',
  date: '2026-07-16',
  updated: '2026-07-16',
  domain: 'Software systems',
  domainKey: 'software-systems',
  translationKey: 'optimistic-concurrency',
}

describe('learn utilities', () => {
  it('normalizes localized content paths into a locale-neutral route', () => {
    expect(getLearnSlug('/zh/learn/optimistic-concurrency')).toBe('optimistic-concurrency')
    expect(getLearnRoute('/zh/learn/optimistic-concurrency')).toBe(
      '/learn/optimistic-concurrency',
    )
  })

  it('filters drafts and sorts by update date', () => {
    const concepts = prepareLearn([
      { ...base, path: '/learn/older', updated: '2026-01-01', published: true },
      { ...base, path: '/learn/newer', updated: '2026-07-16', published: true },
      { ...base, path: '/learn/draft', updated: '2026-07-17', published: false },
    ])

    expect(concepts.map((concept) => concept.path)).toEqual(['/learn/newer', '/learn/older'])
  })

  it('searches across concept names, tags, and neighbors while respecting the domain filter', () => {
    const concepts = prepareLearn([
      {
        ...base,
        path: '/learn/optimistic-concurrency',
        published: true,
        tags: ['concurrency', 'database'],
        neighbors: [
          {
            name: 'MVCC',
            fullName: 'Multi-Version Concurrency Control',
            category: 'storage model',
            summary: 'Keeps multiple versions for consistent reads.',
          },
        ],
      },
      {
        ...base,
        path: '/learn/compound-interest',
        title: 'Compound Interest',
        fullName: 'Compound Interest',
        shortName: 'Compounding',
        domain: 'Finance',
        domainKey: 'finance',
        tags: ['returns'],
        neighbors: [],
        published: true,
      },
    ])

    expect(filterLearn(concepts, { query: 'mvcc' }).map((concept) => concept.shortName)).toEqual([
      'OCC',
    ])
    expect(
      filterLearn(concepts, { query: 'returns', domainKey: 'finance' }).map(
        (concept) => concept.shortName,
      ),
    ).toEqual(['Compounding'])
    expect(filterLearn(concepts, { query: 'returns', domainKey: 'software-systems' })).toEqual([])
  })

  it('publishes optimized visual cards without replacing the full-resolution source', () => {
    const slugs = [
      'optimistic-concurrency',
      'idempotency',
      'progressive-disclosure',
      'single-source-of-truth',
    ]
    const indexPage = readFileSync(join(root, 'pages/learn/index.vue'), 'utf8')
    const detailPage = readFileSync(join(root, 'pages/learn/[slug].vue'), 'utf8')
    const config = readFileSync(join(root, 'content.config.ts'), 'utf8')

    expect(config).toContain('cardImage: z.string().optional()')
    expect(config).toContain('cardImageAlt: z.string().optional()')
    expect(indexPage).toContain(':src="concept.cardImage"')
    expect(indexPage).toContain('quality="72"')
    expect(detailPage).toContain('quality="80"')
    expect(detailPage).toContain('download')

    for (const slug of slugs) {
      const expectedPath = `/learn-img/${slug}/card-4x5.jpg`

      for (const locale of ['en', 'zh']) {
        const concept = readFileSync(
          join(root, 'content', 'learn', locale, `${slug}.md`),
          'utf8',
        )
        expect(concept).toMatch(new RegExp(`^cardImage:\\s*['"]${expectedPath}['"]$`, 'm'))
        expect(concept).toMatch(/^cardImageAlt:\s*['"].+['"]$/m)
      }

      expect(existsSync(join(root, 'public', 'learn-img', slug, 'card-4x5.jpg'))).toBe(true)
    }
  })
})
