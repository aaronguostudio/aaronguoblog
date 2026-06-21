import type { SignalBrief } from '../data/signal/briefs'
import { normalizeSignalBriefLocale } from '../data/signal/briefs'

export type SignalBriefCardSection = {
  heading: string
  body: string[]
  bullets: string[]
}

export type SignalBriefCard = {
  slug: string
  threadSlug: string
  date: string
  readTime: string
  title: string
  description: string
  sections: SignalBriefCardSection[]
}

export function createSignalBriefCards({
  briefs,
  locale,
}: {
  briefs: SignalBrief[]
  locale: string
}): SignalBriefCard[] {
  const signalLocale = normalizeSignalBriefLocale(locale)

  return briefs.map((brief) => ({
    slug: brief.slug,
    threadSlug: brief.threadSlug,
    date: brief.date,
    readTime: brief.readTime[signalLocale] || brief.readTime.en,
    title: brief.title[signalLocale] || brief.title.en,
    description: brief.description[signalLocale] || brief.description.en,
    sections: brief.sections.map((section) => ({
      heading: section.heading[signalLocale] || section.heading.en,
      body: section.body.map((paragraph) => paragraph[signalLocale] || paragraph.en),
      bullets: (section.bullets || []).map((bullet) => bullet[signalLocale] || bullet.en),
    })),
  }))
}
