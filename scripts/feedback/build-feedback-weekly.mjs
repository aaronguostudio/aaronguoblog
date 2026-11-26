import { randomUUID } from 'node:crypto'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'

const day = 86_400_000
const timezone = 'America/Edmonton'

function weekOne(year) {
  const january4 = new Date(0)
  january4.setUTCFullYear(year, 0, 4)
  return january4.getTime() - ((january4.getUTCDay() + 6) % 7) * day
}

function weekStarting(week, now) {
  if (week !== undefined) {
    const match = /^(\d{4})-W(0[1-9]|[1-4]\d|5[0-3])$/.exec(week)
    if (!match || Number(match[1]) < 1) throw new Error('Expected an ISO week such as 2026-W47')
    const year = Number(match[1])
    const monday = weekOne(year) + (Number(match[2]) - 1) * 7 * day
    if (monday >= weekOne(year + 1)) throw new Error(`ISO week does not exist: ${week}`)
    return monday
  }

  // Work with calendar dates so daylight-saving changes do not affect the range.
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now)
  const date = new Date(localDate + 'T00:00:00Z')
  return date.getTime() - (((date.getUTCDay() + 6) % 7) + 7) * day
}

const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--week')) {
  throw new Error('Usage: node scripts/feedback/build-feedback-weekly.mjs [--week YYYY-Www]')
}

const now = new Date()
const monday = weekStarting(args[1], now)
const weekYear = new Date(monday + 3 * day).getUTCFullYear()
const weekNumber = (monday - weekOne(weekYear)) / (7 * day) + 1
const week = `${String(weekYear).padStart(4, '0')}-W${String(weekNumber).padStart(2, '0')}`
const date = timestamp => new Date(timestamp).toISOString().slice(0, 10)
const report = {
  schema_version: 1,
  week,
  timezone,
  period_start: date(monday),
  period_end: date(monday + 6 * day),
  generated_at: now.toISOString(),
}
// Phase 2 will add editorial. Phase 3 will add site and external after successful reads.
const output = new URL('../../feedback/', import.meta.url)
await mkdir(output, { recursive: true })
const name = `feedback-weekly-${week}.json`
const staging = new URL(`.${randomUUID()}.tmp`, output)
try {
  await writeFile(staging, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
  await rename(staging, new URL(name, output))
} finally {
  await rm(staging, { force: true })
}
console.log(`feedback/${name}`)
