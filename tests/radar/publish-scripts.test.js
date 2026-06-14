import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const PUBLISH_SCRIPT = readFileSync(new URL('../../scripts/radar/publish-local.sh', import.meta.url), 'utf8')
const INSTALL_SCRIPT = readFileSync(new URL('../../scripts/radar/install-launch-agent.sh', import.meta.url), 'utf8')

describe('Radar local publish scripts', () => {
  it('runs the full publish pipeline with a local lock', () => {
    expect(PUBLISH_SCRIPT).toContain('$HOME/.config/aaronguo/radar.env')
    expect(PUBLISH_SCRIPT).toContain('publish.lock')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:migrate')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:run --cadence daily')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:run --cadence weekly')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:export')
    expect(PUBLISH_SCRIPT).toContain('pnpm run generate')
    expect(PUBLISH_SCRIPT).toContain('git commit')
    expect(PUBLISH_SCRIPT).toContain('git push')
  })

  it('does not hard-code secrets in the publish script', () => {
    expect(PUBLISH_SCRIPT).not.toMatch(/(?:TURSO_AUTH_TOKEN|OPENAI_API_KEY|BRAVE_API_KEY)=['"][^'"]+/)
  })

  it('installs a morning macOS LaunchAgent', () => {
    expect(INSTALL_SCRIPT).toContain('com.aaronguo.radar-publish.plist')
    expect(INSTALL_SCRIPT).toContain('StartCalendarInterval')
    expect(INSTALL_SCRIPT).toContain('<key>Hour</key>')
    expect(INSTALL_SCRIPT).toContain('<integer>7</integer>')
    expect(INSTALL_SCRIPT).toContain('<key>Minute</key>')
    expect(INSTALL_SCRIPT).toContain('<integer>30</integer>')
    expect(INSTALL_SCRIPT).toContain('launchctl')
  })
})
