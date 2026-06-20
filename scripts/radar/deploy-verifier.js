import { readFileSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

const DEFAULT_SITE_URL = 'https://www.aaronguo.com'
const DEFAULT_SNAPSHOT_PATH = 'public/radar/latest.json'
const DEFAULT_ATTEMPTS = 20
const DEFAULT_DELAY_MS = 30000

function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '')
}

function snapshotDate(snapshot) {
  return snapshot?.pulse?.date || snapshot?.date || ''
}

export function deployedSnapshotMatches(expected, actual) {
  return Boolean(
    expected?.date &&
      expected?.generatedAt &&
      actual?.date === expected.date &&
      actual?.generatedAt === expected.generatedAt,
  )
}

export function signalHtmlContainsSnapshot(html, snapshot) {
  const date = snapshotDate(snapshot)
  return Boolean(date && String(html || '').includes(date))
}

function readExpectedSnapshot(snapshotPath = DEFAULT_SNAPSHOT_PATH) {
  return JSON.parse(readFileSync(snapshotPath, 'utf8'))
}

async function fetchText(fetchImpl, url) {
  const response = await fetchImpl(url, { cache: 'no-cache' })
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`)
  }
  return response.text()
}

async function fetchJson(fetchImpl, url) {
  return JSON.parse(await fetchText(fetchImpl, url))
}

export async function verifyDeployedRadarSnapshot({
  siteUrl = DEFAULT_SITE_URL,
  expectedSnapshot = readExpectedSnapshot(),
  attempts = DEFAULT_ATTEMPTS,
  delayMs = DEFAULT_DELAY_MS,
  fetchImpl = fetch,
  logger = console,
} = {}) {
  const baseUrl = normalizeSiteUrl(siteUrl)
  const latestUrl = `${baseUrl}/radar/latest.json`
  const signalUrl = `${baseUrl}/signal`
  let lastMessage = ''

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const [remoteSnapshot, signalHtml] = await Promise.all([
        fetchJson(fetchImpl, latestUrl),
        fetchText(fetchImpl, signalUrl),
      ])

      const jsonMatches = deployedSnapshotMatches(expectedSnapshot, remoteSnapshot)
      const signalMatches = signalHtmlContainsSnapshot(signalHtml, expectedSnapshot)

      if (jsonMatches && signalMatches) {
        logger.log(`Verified deployed Radar snapshot ${expectedSnapshot.date} at ${baseUrl}`)
        return { ok: true, attempts: attempt }
      }

      lastMessage = [
        `remote JSON match: ${jsonMatches}`,
        `Signal HTML match: ${signalMatches}`,
        `expected date: ${expectedSnapshot.date}`,
        `remote date: ${remoteSnapshot?.date || 'missing'}`,
      ].join('; ')
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : String(error)
    }

    if (attempt < attempts) {
      logger.log(`Deploy verification attempt ${attempt}/${attempts} pending: ${lastMessage}`)
      await delay(delayMs)
    }
  }

  throw new Error(`Radar deploy verification failed after ${attempts} attempts: ${lastMessage}`)
}

async function main() {
  await verifyDeployedRadarSnapshot({
    siteUrl: process.env.RADAR_SITE_URL || DEFAULT_SITE_URL,
    attempts: Number(process.env.RADAR_DEPLOY_VERIFY_ATTEMPTS || DEFAULT_ATTEMPTS),
    delayMs: Number(process.env.RADAR_DEPLOY_VERIFY_DELAY_MS || DEFAULT_DELAY_MS),
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
