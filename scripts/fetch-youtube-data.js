#!/usr/bin/env node

/**
 * YouTube Data Fetcher Script
 *
 * Fetches data from the YouTube Data API v3 for all configured channels
 * and generates a static JSON file to power the Videos page.
 *
 * Usage:
 *   node scripts/fetch-youtube-data.js
 *
 * Requirements:
 *   - YOUTUBE_API_KEY environment variable must be set
 *   - Node.js 18+ (for native fetch support)
 */

import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file manually
function loadEnv() {
  try {
    const envPath = join(__dirname, '../.env')
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key.trim()] = value.trim()
        }
      }
    })
  } catch {
    // .env file doesn't exist, that's okay
  }
}

loadEnv()

// Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const MAX_RESULTS = 50
const OUTPUT_FILE = join(__dirname, '../data/youtube.json')

const CHANNELS = [
  { key: 'drumnext', id: 'UCO_h81XNKntuUxUrem8gj1g', handle: '@drumnext' },
  { key: 'ai-native-builder', id: 'UC00lw_bsmcXk7Dxuk_QqBTg', handle: '@ai-native-builder' },
  { key: 'visual-and-sound', id: 'UCb_GiFrPo47Ot_k0bEMJhng', handle: '@visual-and-sound' },
]

// Validate API key
if (!YOUTUBE_API_KEY) {
  console.error('Error: YOUTUBE_API_KEY environment variable is not set')
  console.error('Please set it in your .env file or export it:')
  console.error('  export YOUTUBE_API_KEY=your_api_key_here')
  process.exit(1)
}

/**
 * Fetch channel statistics
 */
async function fetchChannelStats(channelId) {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels')
  url.searchParams.append('part', 'statistics,snippet,brandingSettings')
  url.searchParams.append('id', channelId)
  url.searchParams.append('key', YOUTUBE_API_KEY)

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Failed to fetch channel stats: ${response.statusText}`)

  const data = await response.json()
  if (!data.items || data.items.length === 0) throw new Error('Channel not found')

  const channel = data.items[0]
  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    thumbnail: channel.snippet.thumbnails.high.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount),
    videoCount: parseInt(channel.statistics.videoCount),
    viewCount: parseInt(channel.statistics.viewCount),
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || null,
  }
}

/**
 * Fetch videos from a channel
 */
async function fetchVideos(channelId) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.append('part', 'snippet')
  url.searchParams.append('channelId', channelId)
  url.searchParams.append('maxResults', MAX_RESULTS.toString())
  url.searchParams.append('order', 'date')
  url.searchParams.append('type', 'video')
  url.searchParams.append('key', YOUTUBE_API_KEY)

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Failed to fetch videos: ${response.statusText}`)

  const data = await response.json()
  if (!data.items || data.items.length === 0) return []

  const videoIds = data.items.map((item) => item.id.videoId).join(',')

  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  detailsUrl.searchParams.append('part', 'contentDetails,statistics')
  detailsUrl.searchParams.append('id', videoIds)
  detailsUrl.searchParams.append('key', YOUTUBE_API_KEY)

  const detailsResponse = await fetch(detailsUrl.toString())
  if (!detailsResponse.ok) throw new Error(`Failed to fetch video details: ${detailsResponse.statusText}`)

  const detailsData = await detailsResponse.json()
  const detailsMap = new Map(detailsData.items.map((item) => [item.id, item]))

  return data.items.map((item) => {
    const details = detailsMap.get(item.id.videoId)
    const duration = details?.contentDetails?.duration || 'PT0S'
    const durationSeconds = parseDuration(duration)
    const isShort = durationSeconds > 0 && durationSeconds <= 60

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      duration,
      durationSeconds,
      isShort,
      viewCount: parseInt(details?.statistics?.viewCount || 0),
      likeCount: parseInt(details?.statistics?.likeCount || 0),
      commentCount: parseInt(details?.statistics?.commentCount || 0),
    }
  })
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return parseInt(match[1] || 0) * 3600 + parseInt(match[2] || 0) * 60 + parseInt(match[3] || 0)
}

function formatNumber(num) {
  return num.toLocaleString('en-US')
}

/**
 * Fetch data for a single channel
 */
async function fetchChannelData(channelConfig) {
  console.log(`\n--- ${channelConfig.handle} ---`)
  console.log('  Fetching stats and videos...')

  const [channelStats, videos] = await Promise.all([
    fetchChannelStats(channelConfig.id),
    fetchVideos(channelConfig.id),
  ])

  const shorts = videos.filter((v) => v.isShort)
  const regularVideos = videos.filter((v) => !v.isShort)

  console.log(`  ${channelStats.title}: ${formatNumber(channelStats.subscriberCount)} subs, ${regularVideos.length} videos, ${shorts.length} shorts`)

  return {
    channel: channelStats,
    videos: regularVideos,
    shorts,
    stats: {
      totalVideos: videos.length,
      regularVideosCount: regularVideos.length,
      shortsCount: shorts.length,
    },
  }
}

async function main() {
  try {
    console.log('Starting YouTube data fetch for all channels...')

    const results = {}
    for (const ch of CHANNELS) {
      results[ch.key] = await fetchChannelData(ch)
    }

    const outputData = {
      channels: results,
      metadata: {
        fetchedAt: new Date().toISOString(),
      },
    }

    writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8')

    console.log('\nSaved to:', OUTPUT_FILE)
    console.log('Done!')
  } catch (error) {
    console.error('\nError:', error.message)
    process.exit(1)
  }
}

main()
