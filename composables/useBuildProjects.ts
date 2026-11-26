import type { PageCollectionItemBase } from '@nuxt/content'

interface ProjectMeta {
  title?: string
  description?: string
  tech?: string[]
  published?: boolean
  logo?: string
  screenshots?: string[]
  screenshotLabels?: string[]
  mediaPresentation?: 'slideshow'
  github?: string
  release?: string
  appStore?: string
  demo?: string
  blog?: string
  caseStudy?: string
  featured?: boolean
  order?: number
  layout?: 'copy-media' | 'media-copy'
  tone?: string
  mediaFit?: 'cover' | 'contain'
  mediaAspect?: 'standard' | 'wide' | 'landscape'
  mediaLabel?: string
  imageAlt?: string
  cardImage?: string
  cardSummary?: string
}

function toBuildProject(entry: PageCollectionItemBase) {
  const root = entry as PageCollectionItemBase & ProjectMeta
  const meta = (entry.meta ?? root) as ProjectMeta
  const featured = Boolean(meta.featured ?? root.featured ?? false)
  const requestedLayout = meta.layout ?? root.layout
  const layout =
    requestedLayout === 'copy-media' || requestedLayout === 'media-copy'
      ? requestedLayout
      : featured
        ? 'copy-media'
        : 'media-copy'
  const order = Number(meta.order ?? root.order)

  return {
    slug: entry.stem.slice(entry.stem.lastIndexOf('/') + 1),
    name: entry.title || meta.title || root.title || 'Project',
    description: entry.description ?? meta.description ?? root.description ?? '',
    tech: Array.isArray(meta.tech) ? meta.tech : Array.isArray(root.tech) ? root.tech : [],
    published: Boolean(meta.published ?? root.published ?? true),
    logo: meta.logo ?? root.logo,
    screenshots: Array.isArray(meta.screenshots)
      ? meta.screenshots
      : Array.isArray(root.screenshots)
        ? root.screenshots
        : undefined,
    github: meta.github ?? root.github,
    screenshotLabels: meta.screenshotLabels ?? root.screenshotLabels,
    mediaPresentation: meta.mediaPresentation ?? root.mediaPresentation,
    release: meta.release ?? root.release,
    appStore: meta.appStore ?? root.appStore,
    demo: meta.demo ?? root.demo,
    blog: meta.blog ?? root.blog,
    caseStudy: meta.caseStudy ?? root.caseStudy,
    featured,
    order: Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER,
    layout,
    tone: meta.tone ?? root.tone,
    mediaFit: meta.mediaFit ?? root.mediaFit ?? 'cover',
    mediaAspect: meta.mediaAspect ?? root.mediaAspect ?? 'standard',
    mediaLabel: meta.mediaLabel ?? root.mediaLabel,
    imageAlt: meta.imageAlt ?? root.imageAlt,
    cardImage: meta.cardImage ?? root.cardImage,
    cardSummary: meta.cardSummary ?? root.cardSummary,
  }
}

export type BuildProject = ReturnType<typeof toBuildProject>

function publicProjects(entries: PageCollectionItemBase[]) {
  return entries
    .map(toBuildProject)
    .filter((project) => project.published)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      return a.order - b.order
    })
}

export function useBuildProjects() {
  return useAsyncData('public-build-projects', async () => {
    const [en, zh] = await Promise.all([
      queryCollection('projectsEn').all(),
      queryCollection('projectsZh').all(),
    ])
    return { en: publicProjects(en), zh: publicProjects(zh) }
  })
}
