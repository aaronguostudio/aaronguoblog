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

function decodeHtmlEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"',
  }

  return String(value || '').replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (entity, token) => {
    const lowerToken = token.toLowerCase()
    if (!lowerToken.startsWith('#')) return named[lowerToken] || entity

    const codePoint = lowerToken.startsWith('#x')
      ? Number.parseInt(lowerToken.slice(2), 16)
      : Number.parseInt(lowerToken.slice(1), 10)

    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity
  })
}

function selectBestThumbnail(thumbnails) {
  const preferredSizes = ['maxres', 'standard', 'high', 'medium', 'default']

  for (const size of preferredSizes) {
    const thumbnail = thumbnails?.[size]
    if (thumbnail?.url) {
      return {
        url: thumbnail.url,
        width: thumbnail.width || 0,
        height: thumbnail.height || 0,
        quality: size,
      }
    }
  }

  return {
    url: '',
    width: 0,
    height: 0,
    quality: 'unknown',
  }
}

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
  url.searchParams.append('part', 'statistics,snippet,brandingSettings,contentDetails')
  url.searchParams.append('id', channelId)
  url.searchParams.append('key', YOUTUBE_API_KEY)

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Failed to fetch channel stats: ${response.statusText}`)

  const data = await response.json()
  if (!data.items || data.items.length === 0) throw new Error('Channel not found')

  const channel = data.items[0]
  const thumbnail = selectBestThumbnail(channel.snippet.thumbnails)

  return {
    uploadsPlaylist: channel.contentDetails.relatedPlaylists.uploads,
    id: channel.id,
    title: decodeHtmlEntities(channel.snippet.title),
    description: decodeHtmlEntities(channel.snippet.description),
    customUrl: channel.snippet.customUrl,
    thumbnail: thumbnail.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount),
    videoCount: parseInt(channel.statistics.videoCount),
    viewCount: parseInt(channel.statistics.viewCount),
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || null,
  }
}

/**
 * Fetch videos from a channel
 */
async function fetchVideos(uploadsPlaylist) {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
  url.searchParams.append('part', 'contentDetails')
  url.searchParams.append('playlistId', uploadsPlaylist)
  url.searchParams.append('maxResults', MAX_RESULTS.toString())
  url.searchParams.append('key', YOUTUBE_API_KEY)

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Failed to fetch videos: ${response.statusText}`)

  const data = await response.json()
  if (!data.items || data.items.length === 0) return []

  const videoIds = data.items.map((item) => item.contentDetails.videoId).join(',')

  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  detailsUrl.searchParams.append('part', 'snippet,contentDetails,statistics,status')
  detailsUrl.searchParams.append('id', videoIds)
  detailsUrl.searchParams.append('key', YOUTUBE_API_KEY)

  const detailsResponse = await fetch(detailsUrl.toString())
  if (!detailsResponse.ok) throw new Error(`Failed to fetch video details: ${detailsResponse.statusText}`)

  const detailsData = await detailsResponse.json()
  return detailsData.items
    .filter(video => video.status.privacyStatus === 'public')
    .sort((a, b) => b.snippet.publishedAt.localeCompare(a.snippet.publishedAt))
    .map((details) => {
      const duration = details.contentDetails.duration
      const durationSeconds = parseDuration(duration)
      const isShort = durationSeconds > 0 && durationSeconds <= 60
      const thumbnail = selectBestThumbnail(details.snippet.thumbnails)

      return {
        id: details.id,
        title: decodeHtmlEntities(details.snippet.title),
        description: decodeHtmlEntities(details.snippet.description),
        thumbnail: thumbnail.url,
        thumbnailWidth: thumbnail.width,
        thumbnailHeight: thumbnail.height,
        thumbnailQuality: thumbnail.quality,
        publishedAt: details.snippet.publishedAt,
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

  const { uploadsPlaylist, ...channelStats } = await fetchChannelStats(channelConfig.id)
  const videos = await fetchVideos(uploadsPlaylist)

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

    const expectedId = process.argv.find(arg => arg.startsWith('--expect='))?.slice('--expect='.length)
    if (expectedId && !results['ai-native-builder'].videos.some(video => video.id === expectedId)) {
      throw new Error('The published episode is not in the public uploads feed yet')
    }

    if (process.argv.includes('--scheduled')) {
      const previous = JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'))
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton' })
      const sameDay = day.format(new Date(previous.metadata.fetchedAt)) === day.format(new Date())
      // Refresh counters daily. Within the day, publish only actual catalog changes.
      const catalog = channels => JSON.stringify(channels, (key, value) =>
        ['subscriberCount', 'viewCount', 'commentCount', 'likeCount'].includes(key) ? undefined : value)
      if (sameDay && catalog(previous.channels) === catalog(results)) return
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
