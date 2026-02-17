#!/usr/bin/env node

/**
 * YouTube Data Fetcher Script
 *
 * This script fetches data from the YouTube Data API v3 and generates
 * a static JSON file to power the Drum page.
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
          const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remove quotes
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
const CHANNEL_ID = 'UCO_h81XNKntuUxUrem8gj1g' // @drumnext
const MAX_RESULTS = 50 // Fetch up to 50 videos
const OUTPUT_FILE = join(__dirname, '../data/youtube.json')

// Validate API key
if (!YOUTUBE_API_KEY) {
  console.error('❌ Error: YOUTUBE_API_KEY environment variable is not set')
  console.error('Please set it in your .env file or export it:')
  console.error('  export YOUTUBE_API_KEY=your_api_key_here')
  process.exit(1)
}

/**
 * Fetch channel statistics
 */
async function fetchChannelStats() {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels')
  url.searchParams.append('part', 'statistics,snippet,brandingSettings')
  url.searchParams.append('id', CHANNEL_ID)
  url.searchParams.append('key', YOUTUBE_API_KEY)

  console.log('📊 Fetching channel statistics...')
  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch channel stats: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found')
  }

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
 * Fetch videos from the channel
 */
async function fetchVideos() {
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.append('part', 'snippet')
  url.searchParams.append('channelId', CHANNEL_ID)
  url.searchParams.append('maxResults', MAX_RESULTS.toString())
  url.searchParams.append('order', 'date')
  url.searchParams.append('type', 'video')
  url.searchParams.append('key', YOUTUBE_API_KEY)

  console.log('🎥 Fetching videos...')
  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch videos: ${response.statusText}`)
  }

  const data = await response.json()

  // Get video IDs to fetch additional details
  const videoIds = data.items.map((item) => item.id.videoId).join(',')

  // Fetch video details (duration, view count, etc.)
  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  detailsUrl.searchParams.append('part', 'contentDetails,statistics')
  detailsUrl.searchParams.append('id', videoIds)
  detailsUrl.searchParams.append('key', YOUTUBE_API_KEY)

  console.log('📝 Fetching video details...')
  const detailsResponse = await fetch(detailsUrl.toString())

  if (!detailsResponse.ok) {
    throw new Error(`Failed to fetch video details: ${detailsResponse.statusText}`)
  }

  const detailsData = await detailsResponse.json()

  // Create a map of video details
  const detailsMap = new Map(detailsData.items.map((item) => [item.id, item]))

  // Combine search results with details
  return data.items.map((item) => {
    const details = detailsMap.get(item.id.videoId)
    const duration = details?.contentDetails?.duration || 'PT0S'

    // Parse ISO 8601 duration to seconds
    const durationSeconds = parseDuration(duration)
    const isShort = durationSeconds > 0 && durationSeconds <= 60

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      duration: duration,
      durationSeconds: durationSeconds,
      isShort: isShort,
      viewCount: parseInt(details?.statistics?.viewCount || 0),
      likeCount: parseInt(details?.statistics?.likeCount || 0),
      commentCount: parseInt(details?.statistics?.commentCount || 0),
    }
  })
}

/**
 * Parse ISO 8601 duration to seconds
 * Example: PT1M30S = 90 seconds, PT45S = 45 seconds
 */
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || 0)
  const minutes = parseInt(match[2] || 0)
  const seconds = parseInt(match[3] || 0)

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toLocaleString('en-US')
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting YouTube data fetch...\n')

    // Fetch channel stats and videos in parallel
    const [channelStats, videos] = await Promise.all([fetchChannelStats(), fetchVideos()])

    // Separate shorts and regular videos
    const shorts = videos.filter((v) => v.isShort)
    const regularVideos = videos.filter((v) => !v.isShort)

    // Prepare output data
    const outputData = {
      channel: channelStats,
      videos: regularVideos,
      shorts: shorts,
      stats: {
        totalVideos: videos.length,
        regularVideosCount: regularVideos.length,
        shortsCount: shorts.length,
      },
      metadata: {
        fetchedAt: new Date().toISOString(),
        channelId: CHANNEL_ID,
      },
    }

    // Write to file
    writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8')

    // Print summary
    console.log('\n✅ Success! YouTube data saved to:', OUTPUT_FILE)
    console.log('\n📊 Summary:')
    console.log(`   Channel: ${channelStats.title}`)
    console.log(`   Subscribers: ${formatNumber(channelStats.subscriberCount)}`)
    console.log(`   Total Views: ${formatNumber(channelStats.viewCount)}`)
    console.log(`   Total Videos: ${channelStats.videoCount}`)
    console.log(`   Fetched Videos: ${videos.length}`)
    console.log(`   - Regular Videos: ${regularVideos.length}`)
    console.log(`   - Shorts: ${shorts.length}`)
    console.log('\n🎉 Done! You can now commit and push the changes.')
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
