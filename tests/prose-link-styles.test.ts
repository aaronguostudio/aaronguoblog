import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function loadTailwindConfig() {
  const filename = join(root, 'tailwind.config.js')
  const source = readFileSync(filename, 'utf8')
  const module = { exports: {} }

  vm.runInNewContext(
    source,
    {
      module,
      exports: module.exports,
      require: createRequire(filename),
    },
    { filename },
  )

  return module.exports as {
    theme: {
      extend: {
        typography: () => {
          DEFAULT: {
            css: {
              a: Record<string, unknown>
            }
          }
        }
      }
    }
  }
}

describe('prose link styles', () => {
  it('makes article links visibly underlined', () => {
    const config = loadTailwindConfig()
    const anchorStyles = config.theme.extend.typography().DEFAULT.css.a

    expect(anchorStyles.textDecoration).toBe('underline')
    expect(anchorStyles.textUnderlineOffset).toBeTruthy()
    expect(anchorStyles.textDecorationThickness).toBeTruthy()
  })

  it('keeps hash anchors visually quieter than content links', () => {
    const config = loadTailwindConfig()
    const anchorStyles = config.theme.extend.typography().DEFAULT.css.a
    const hashAnchorStyles = anchorStyles['&[href^="#"]'] as Record<string, unknown>

    expect(hashAnchorStyles.textDecoration).toBe('none')
  })

  it('does not remove underlines from prose anchors in the Tailwind entry CSS', () => {
    const css = readFileSync(join(root, 'assets', 'css', 'tailwind.css'), 'utf8')

    expect(css).toMatch(/\.prose\s*\{[\s\S]*?a\s*\{[\s\S]*?text-decoration:\s*underline;/)
    expect(css).not.toMatch(/\.prose\s*\{[\s\S]*?a\s*\{[\s\S]*?text-decoration:\s*none;/)
  })
})
