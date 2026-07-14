#!/usr/bin/env node
import { pathToFileURL } from 'node:url'
import { getRadarTopics } from './config.js'
import { runDailyConclusionPipeline } from './daily-conclusion.js'
import { runDeepReadPipeline } from './deep-reader.js'
import { runRadar } from './runner.js'
import { createRadarClient, discoverSchema, migrateRadarSchema } from './repository.js'
import { exportRadarSnapshot } from './static-export.js'

const ALLOWED_CADENCES = new Set(['daily', 'weekly', 'manual'])

function readFlagValue(argv, index, flag) {
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`)
  }
  return value
}

export function parseArgs(argv) {
  const args = { command: argv[2], dryRun: false, topicSlug: undefined, cadence: undefined }
  for (let index = 3; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--dry-run') {
      args.dryRun = true
      continue
    }

    if (value === '--allow-local-ranking') {
      args.allowLocalRanking = true
      continue
    }

    if (value === '--max-topics') {
      const rawValue = readFlagValue(argv, index, value)
      const maxTopics = Number(rawValue)
      if (!Number.isInteger(maxTopics) || maxTopics < 1) {
        throw new Error('--max-topics must be a positive integer')
      }
      args.maxTopics = maxTopics
      index += 1
      continue
    }

    if (value === '--topic') {
      args.topicSlug = readFlagValue(argv, index, value)
      index += 1
      continue
    }

    if (value === '--cadence') {
      args.cadence = readFlagValue(argv, index, value)
      if (!ALLOWED_CADENCES.has(args.cadence)) {
        throw new Error('--cadence must be daily, weekly, or manual')
      }
      index += 1
      continue
    }

    if (value.startsWith('--')) {
      throw new Error(`Unknown flag: ${value}`)
    }

    throw new Error(`Unknown argument: ${value}`)
  }
  return args
}

export async function main() {
  const args = parseArgs(process.argv)

  if (args.command === 'topics') {
    console.log(JSON.stringify(getRadarTopics(), null, 2))
    return
  }

  if (args.command === 'diagnose') {
    const client = createRadarClient()
    const schema = await discoverSchema(client)
    console.log(JSON.stringify({ ok: true, schema }, null, 2))
    return
  }

  if (args.command === 'migrate') {
    const client = createRadarClient()
    await migrateRadarSchema(client)
    console.log(JSON.stringify({ ok: true, action: 'migrated' }, null, 2))
    return
  }

  if (args.command === 'run') {
    const client = args.dryRun ? undefined : createRadarClient()
    const results = await runRadar({
      topicSlug: args.topicSlug,
      dryRun: args.dryRun,
      cadence: args.cadence,
      client,
    })
    console.log(JSON.stringify({ ok: true, results }, null, 2))
    if (results.some((result) => result.status === 'failed')) {
      process.exitCode = 1
    }
    return
  }

  if (args.command === 'deep-read') {
    const client = createRadarClient()
    const results = await runDeepReadPipeline({
      client,
      maxTopics: args.maxTopics || 1,
    })
    console.log(JSON.stringify({ ok: true, results }, null, 2))
    if (results.some((result) => result.status === 'failed')) {
      process.exitCode = 1
    }
    return
  }

  if (args.command === 'conclude') {
    const client = createRadarClient()
    const results = await runDailyConclusionPipeline({ client })
    console.log(JSON.stringify({ ok: true, results }, null, 2))
    if (results.some((result) => result.status === 'failed')) {
      process.exitCode = 1
    }
    return
  }

  if (args.command === 'export') {
    const client = createRadarClient()
    const result = await exportRadarSnapshot({
      client,
      allowLocalRanking: Boolean(args.allowLocalRanking),
    })
    console.log(
      JSON.stringify(
        {
          ok: true,
          latestPath: result.latestPath,
          datedPath: result.datedPath,
          quality: result.snapshot.quality,
          items: result.snapshot.items.length,
          topics: result.snapshot.topics.length,
        },
        null,
        2,
      ),
    )
    return
  }

  throw new Error(
    'Usage: node scripts/radar/cli.js <topics|diagnose|migrate|run|conclude|deep-read|export> [--topic slug] [--dry-run] [--cadence daily] [--max-topics 1] [--allow-local-ranking]',
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
    process.exit(1)
  })
}
