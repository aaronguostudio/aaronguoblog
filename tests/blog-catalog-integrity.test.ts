import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('Blog archive catalog integrity', () => {
  it('loads the complete bilingual published archive, beyond Nuxt Content default caps', () => {
    const output = execFileSync(process.execPath, ['scripts/verify-blog-catalog.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })

    expect(output).toContain('Blog catalog verified:')
    expect(output).toContain('26 published EN/ZH pairs')
  })
})
