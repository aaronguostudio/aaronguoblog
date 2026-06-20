import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import packageJson from '../../package.json'

const PUBLISH_SCRIPT = readFileSync(new URL('../../scripts/radar/publish-local.sh', import.meta.url), 'utf8')
const INSTALL_SCRIPT = readFileSync(new URL('../../scripts/radar/install-launch-agent.sh', import.meta.url), 'utf8')
const GITHUB_WORKFLOW = readFileSync(new URL('../../.github/workflows/radar.yml', import.meta.url), 'utf8')
const BUILD_WORKFLOW = readFileSync(new URL('../../.github/workflows/build.yml', import.meta.url), 'utf8')

describe('Radar local publish scripts', () => {
  it('runs the full publish pipeline with a local lock', () => {
    expect(PUBLISH_SCRIPT).toContain('$HOME/.config/aaronguo/radar.env')
    expect(PUBLISH_SCRIPT).toContain('publish.lock')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:migrate')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:run --cadence daily')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:run --cadence weekly')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:export')
    expect(PUBLISH_SCRIPT).toContain('pnpm radar:verify-deploy')
    expect(PUBLISH_SCRIPT).toContain('rm -rf .nuxt .output')
    expect(PUBLISH_SCRIPT).toContain('pnpm run generate')
    expect(PUBLISH_SCRIPT).toContain('git commit')
    expect(PUBLISH_SCRIPT).toContain('git push')
  })

  it('does not hard-code secrets in the publish script', () => {
    expect(PUBLISH_SCRIPT).not.toMatch(/(?:TURSO_AUTH_TOKEN|OPENAI_API_KEY|BRAVE_API_KEY)=['"][^'"]+/)
  })

  it('includes Monday weekly enrichment before exporting the static snapshot', () => {
    const dailyRunIndex = PUBLISH_SCRIPT.indexOf('pnpm radar:run --cadence daily')
    const weeklyRunIndex = PUBLISH_SCRIPT.indexOf('pnpm radar:run --cadence weekly')
    const exportIndex = PUBLISH_SCRIPT.indexOf('pnpm radar:export')
    const pushIndex = PUBLISH_SCRIPT.indexOf('git push')

    expect(dailyRunIndex).toBeGreaterThan(-1)
    expect(weeklyRunIndex).toBeGreaterThan(dailyRunIndex)
    expect(exportIndex).toBeGreaterThan(weeklyRunIndex)
    expect(exportIndex).toBeGreaterThan(dailyRunIndex)
    expect(pushIndex).toBeGreaterThan(exportIndex)
  })

  it('verifies the deployed Signal snapshot after publishing', () => {
    const pushIndex = PUBLISH_SCRIPT.indexOf('git push')
    const verifyIndex = PUBLISH_SCRIPT.indexOf('pnpm radar:verify-deploy')

    expect(verifyIndex).toBeGreaterThan(pushIndex)
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

  it('publishes GitHub Radar runs as static blog snapshots', () => {
    expect(GITHUB_WORKFLOW).toContain('contents: write')
    expect(GITHUB_WORKFLOW).toContain('workflow_dispatch:')
    expect(GITHUB_WORKFLOW).not.toContain('schedule:')
    expect(GITHUB_WORKFLOW).toContain('pnpm radar:export')
    expect(GITHUB_WORKFLOW).toContain('pnpm run generate')
    expect(GITHUB_WORKFLOW).toContain('git add public/radar')
    expect(GITHUB_WORKFLOW).toContain('git commit')
    expect(GITHUB_WORKFLOW).toContain('git push')
  })

  it('runs pnpm installs in GitHub without interactive prompts', () => {
    expect(packageJson.packageManager).toBe('pnpm@11.2.2')
    expect(GITHUB_WORKFLOW).toContain('version: 11.2.2')
    expect(BUILD_WORKFLOW).toContain('version: 11.2.2')
    expect(GITHUB_WORKFLOW).toContain('CI=true pnpm install --frozen-lockfile')
    expect(BUILD_WORKFLOW).toContain('CI=true pnpm install --frozen-lockfile')
  })
})
