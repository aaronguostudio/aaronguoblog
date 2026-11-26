type Copy = { en: string; zh: string }
export type SignalEdition = {
  date: string
  cover: 'editorial' | 'atlas' | 'aurora' | 'eclipse' | 'fieldnotes'
  headline: Copy
  intro: Copy
  signal?: { claim: Copy; reasoning: Copy; nextCheck: Copy }
  items: { id: string; title: Copy; note: Copy; evidence: string; discovery: string }[]
}

const snapshots = import.meta.glob<SignalEdition>('./editions/????-??-??.json', {
  eager: true,
  import: 'default',
})
export const signalEditions = Object.values(snapshots).sort((a, b) => b.date.localeCompare(a.date))

export function coverImage(edition: SignalEdition) {
  const cover = edition.cover === 'editorial' ? edition.date : edition.cover
  return '/signal/covers/' + (cover === 'fieldnotes' ? 'plate' : cover) + '.webp'
}
