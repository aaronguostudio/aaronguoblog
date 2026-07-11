import { sortByDate } from './date'

export type NoteLocale = 'en' | 'zh'

export interface NoteContentItem {
  path: string
  title?: string
  description?: string
  date?: string
  summary?: string
  hook?: string
  image?: string
  alt?: string
  topics?: string[]
  published?: boolean
  featured?: boolean
  number?: number
  translationKey?: string
}

export interface NoteCardData {
  path: string
  title: string
  description: string
  date: string
  summary: string
  hook: string
  image?: string
  alt?: string
  topics: string[]
  published: boolean
  featured: boolean
  number?: number
  translationKey?: string
}

export function getNoteSlug(contentPath: string): string {
  return contentPath.replace(/^\/(zh\/)?notes\/(en\/|zh\/)?/, '').replace(/^\//, '')
}

export function getNoteRoute(contentPath: string): string {
  return `/notes/${getNoteSlug(contentPath)}`
}

export function toNoteCard(note: NoteContentItem): NoteCardData {
  const summary = note.summary || note.description || ''

  return {
    path: getNoteRoute(note.path),
    title: note.title || note.hook || 'Untitled note',
    description: note.description || summary,
    date: note.date || '',
    summary,
    hook: note.hook || summary,
    image: note.image,
    alt: note.alt,
    topics: note.topics || [],
    published: note.published === true,
    featured: note.featured === true,
    number: note.number,
    translationKey: note.translationKey,
  }
}

export function prepareNotes(
  items: NoteContentItem[],
  options: { includeDrafts?: boolean } = {},
): NoteCardData[] {
  const notes = items.map(toNoteCard)
  const visibleNotes = options.includeDrafts ? notes : notes.filter((note) => note.published)

  return sortByDate(visibleNotes, 'date')
}

export function formatNoteNumber(number?: number, fallbackIndex = 0): string {
  return String(number || fallbackIndex + 1).padStart(2, '0')
}

export function formatNoteDate(dateString: string, locale = 'en-US'): string {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)

  if (!dateOnlyMatch) return dateString

  const [, year, month, day] = dateOnlyMatch
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
