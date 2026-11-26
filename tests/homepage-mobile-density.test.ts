import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const hero = readFileSync(new URL('../components/main/hero.vue', import.meta.url), 'utf8')
const notes = readFileSync(new URL('../components/main/notes.vue', import.meta.url), 'utf8')
const mobileNotes = notes.slice(0, notes.indexOf('v-if="desktopNote"'))

describe('homepage mobile density', () => {
  it('keeps the mobile hero compact enough to reveal more homepage content', () => {
    expect(hero).toContain('px-5 py-4')
    expect(hero).toContain('text-balance')
    expect(hero).not.toContain('min-h-[')
  })

  it('puts the latest note date and notes shortcut in the section header', () => {
    expect(notes).toContain('activeMobileNote')
    expect(notes).toContain(':datetime="activeMobileNote.date"')
    expect(notes).toContain("heroicons:arrow-up-right")
    expect(notes).toContain(':aria-label="t(\'notes.viewAll\')"')
  })

  it('removes the mobile note number and text CTA rows', () => {
    expect(mobileNotes).not.toContain('formatNoteNumber(note.number, index)')
    expect(mobileNotes).not.toContain('{{ t(\'notes.viewAll\') }}')
  })
})
