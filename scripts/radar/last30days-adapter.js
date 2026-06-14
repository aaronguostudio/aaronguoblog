import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const DEFAULT_LOCAL_CLI = '/Users/aaronguo/.agents/skills/last30days/scripts/last30days.py'

export function resolveLast30DaysCli(env = process.env) {
  return env.LAST30DAYS_CLI || DEFAULT_LOCAL_CLI
}

export function resolvePythonCommand(env = process.env) {
  return env.LAST30DAYS_PYTHON || 'python3.12'
}

export function buildLast30DaysArgs({ topic, saveDir }) {
  const args = [
    topic.query,
    '--emit=json',
    '--days',
    String(topic.lookbackDays),
    topic.mode === 'deep' ? '--deep' : '--quick',
  ]

  if (saveDir) {
    args.push('--save-dir', saveDir)
  }

  const hints = topic.sourceHints || {}
  if (hints.subreddits?.length) {
    args.push('--subreddits', hints.subreddits.join(','))
  }
  if (hints.githubRepos?.length) {
    args.push('--github-repo', hints.githubRepos.join(','))
  }
  if (hints.xHandles?.length) {
    const [primary, ...related] = hints.xHandles
    args.push('--x-handle', primary)
    if (related.length) args.push('--x-related', related.join(','))
  }
  if (hints.tiktokHashtags?.length) {
    args.push('--tiktok-hashtags', hints.tiktokHashtags.join(','))
  }
  if (hints.instagramCreators?.length) {
    args.push('--ig-creators', hints.instagramCreators.join(','))
  }

  return args
}

export function parseLast30DaysJson(stdout) {
  try {
    return JSON.parse(stdout)
  } catch (error) {
    throw new Error(`last30days emitted invalid JSON: ${error.message}`)
  }
}

export async function runLast30Days({ topic, saveDir = '.data/radar/raw', timeoutMs = 300000, env = process.env }) {
  const cliPath = resolveLast30DaysCli(env)
  const pythonCommand = resolvePythonCommand(env)
  const args = buildLast30DaysArgs({ topic, saveDir })
  const { stdout, stderr } = await execFileAsync(pythonCommand, [cliPath, ...args], {
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024 * 20,
    env,
  })

  return {
    report: parseLast30DaysJson(stdout),
    stderr,
    command: [pythonCommand, cliPath, ...args],
  }
}
