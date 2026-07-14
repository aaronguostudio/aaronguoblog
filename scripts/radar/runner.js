import { getRadarTopics, getRadarTopicBySlug } from './config.js'
import { runLast30Days } from './last30days-adapter.js'
import { normalizeLast30DaysReport } from './normalizer.js'
import { generateRadarPulse } from './pulse.js'
import * as defaultRepository from './repository.js'

export async function runRadarTopic({
  topic,
  dryRun = false,
  client,
  adapter = runLast30Days,
  repository = defaultRepository,
}) {
  if (dryRun) {
    const adapterResult = await adapter({ topic })
    const items = normalizeLast30DaysReport({ report: adapterResult.report, topic })

    return {
      topicSlug: topic.slug,
      status: 'dry_run',
      command: adapterResult.command,
      itemsSeen: items.length,
      itemsWritten: 0,
      warnings: adapterResult.report.warnings || [],
      sourceErrors: adapterResult.report.errors_by_source || {},
    }
  }

  await repository.upsertRadarTopic(client, topic)
  const runId = await repository.createRadarRun(client, {
    topicSlug: topic.slug,
    mode: topic.mode,
    lookbackDays: topic.lookbackDays,
    cadence: topic.cadence,
  })

  let adapterResult
  let items
  try {
    adapterResult = await adapter({ topic })
    items = normalizeLast30DaysReport({ report: adapterResult.report, topic })
    const itemIds = await repository.upsertRadarItems(client, { runId, items })
    const pulseItems = items
      .map((item, index) => ({ ...item, id: itemIds[index] }))
      .filter((item) => item.id)
    await repository.finishRadarRun(client, {
      runId,
      status: adapterResult.report.warnings?.length ? 'completed_with_warnings' : 'completed',
      itemsSeen: items.length,
      itemsWritten: itemIds.length,
      warnings: adapterResult.report.warnings || [],
      sourceErrors: adapterResult.report.errors_by_source || {},
    })

    return {
      topicSlug: topic.slug,
      status: adapterResult.report.warnings?.length ? 'completed_with_warnings' : 'completed',
      runId,
      itemsSeen: items.length,
      itemsWritten: itemIds.length,
      pulseItems,
    }
  } catch (error) {
    await repository.finishRadarRun(client, {
      runId,
      status: 'failed',
      itemsSeen: items ? items.length : 0,
      itemsWritten: 0,
      errorMessage: error.message,
    })
    throw error
  }
}

export async function runRadar({
  topicSlug,
  dryRun = false,
  cadence,
  client,
  adapter = runLast30Days,
  repository = defaultRepository,
  maxAttempts = 2,
  today = new Date().toISOString().slice(0, 10),
  generatePulse = generateRadarPulse,
}) {
  const topics = topicSlug
    ? [getRadarTopicBySlug(topicSlug)].filter(Boolean)
    : getRadarTopics().filter(
        (topic) =>
          topic.visibility === 'public' &&
          topic.cadence !== 'manual' &&
          (!cadence || topic.cadence === cadence),
      )

  if (topicSlug && topics.length === 0) {
    throw new Error(`Unknown Radar topic: ${topicSlug}`)
  }

  const results = []
  const completedRuns = []
  const attemptsPerTopic = Math.max(1, Number.isInteger(maxAttempts) ? maxAttempts : 1)
  for (const topic of topics) {
    let lastError
    for (let attempt = 1; attempt <= attemptsPerTopic; attempt += 1) {
      try {
        const result = await runRadarTopic({ topic, dryRun, client, adapter, repository })
        const { pulseItems = [], ...publicResult } = result
        results.push({
          ...publicResult,
          attempts: attempt,
        })
        if (!dryRun && result.runId) {
          completedRuns.push({ runId: result.runId, pulseItems })
        }
        lastError = undefined
        break
      } catch (error) {
        lastError = error
      }
    }

    if (lastError) {
      results.push({
        topicSlug: topic.slug,
        status: 'failed',
        error: lastError.message,
        attempts: attemptsPerTopic,
      })
    }
  }

  if (!dryRun && completedRuns.length > 0) {
    const pulseItems = completedRuns.flatMap((run) => run.pulseItems)
    const pulse = generatePulse({ date: today, items: pulseItems })
    await repository.upsertRadarPulse(client, {
      runId: completedRuns.at(-1).runId,
      pulse,
    })
  }

  return results
}
