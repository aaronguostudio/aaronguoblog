#!/usr/bin/env node
import { getRadarTopics } from './config.js'
import { runRadar } from './runner.js'
import {
  createRadarClient,
  discoverSchema,
  migrateRadarSchema,
} from './repository.js'

function parseArgs(argv) {
  const args = { command: argv[2], dryRun: false, topicSlug: undefined, cadence: undefined }
  for (let index = 3; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--dry-run') args.dryRun = true
    if (value === '--topic') {
      args.topicSlug = argv[index + 1]
      index += 1
    }
    if (value === '--cadence') {
      args.cadence = argv[index + 1]
      index += 1
    }
  }
  return args
}

async function main() {
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
    return
  }

  throw new Error('Usage: node scripts/radar/cli.js <topics|diagnose|migrate|run> [--topic slug] [--dry-run] [--cadence daily]')
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
  process.exit(1)
})
