import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const conceptsDirectory = fileURLToPath(
  new URL('../components/learn/concepts/', import.meta.url),
)
const conceptFiles = readdirSync(conceptsDirectory)
  .filter((file) => file.endsWith('.vue'))
  .sort()

const retiredThemeTokens = [
  '--color-text',
  '--color-text-muted',
  '--color-surface',
  '--color-surface-soft',
]

describe('Learn concept theme contract', () => {
  it.each(conceptFiles)('%s uses the live site theme tokens', (file) => {
    const source = readFileSync(
      new URL(`../components/learn/concepts/${file}`, import.meta.url),
      'utf8',
    )

    expect(source).toContain('var(--foreground)')
    expect(source).toContain('var(--muted-foreground)')

    for (const token of retiredThemeTokens) {
      expect(source).not.toContain(token)
    }
  })
})
