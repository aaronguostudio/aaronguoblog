# Drum Page - YouTube Integration Setup

This document explains the YouTube integration for the Drum page.

## Overview

The Drum page displays your YouTube channel (@drumnext) content using a **static JSON approach**. You run a local script to fetch YouTube data, which generates a JSON file that powers the page.

## Architecture

```
┌─────────────────┐
│  YouTube API    │
└────────┬────────┘
         │
         │ (fetch data locally)
         ▼
┌─────────────────┐
│  Node.js Script │
│  fetch-youtube  │
│     -data.js    │
└────────┬────────┘
         │
         │ (generates)
         ▼
┌─────────────────┐
│ data/youtube    │
│     .json       │
└────────┬────────┘
         │
         │ (imported by)
         ▼
┌─────────────────┐
│  pages/drum.vue │
│  (Drum Page)    │
└─────────────────┘
```

## Files Created/Modified

### New Files
- `scripts/fetch-youtube-data.js` - Script to fetch YouTube data
- `scripts/README.md` - Documentation for the script
- `data/youtube.json` - Generated YouTube data (placeholder)
- `.env.example` - Example environment variables
- `DRUM_PAGE_SETUP.md` - This file

### Modified Files
- `pages/drum.vue` - Updated with YouTube content display
- `i18n/locales/en-US.json` - Added drum page translations
- `i18n/locales/zh-CN.json` - Added Chinese translations
- `package.json` - Added `youtube:fetch` script

## Setup Instructions

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. Copy the API key

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
YOUTUBE_API_KEY=your_actual_api_key_here
```

### 3. Fetch YouTube Data

Run the script to fetch your channel data:

```bash
npm run youtube:fetch
```

This will:
- Fetch channel stats (subscribers, views, videos)
- Fetch up to 50 latest videos
- Separate shorts (≤60s) from regular videos
- Generate `data/youtube.json`

### 4. Review and Commit

1. Check the generated `data/youtube.json`
2. Commit the changes:
   ```bash
   git add data/youtube.json
   git commit -m "Update YouTube data"
   git push
   ```

### 5. Deploy

The Drum page will automatically display the updated content on your next deployment.

## Page Features

The Drum page includes:

### 1. **Page Header**
- Gradient background
- Title and description
- Emoji icon 🥁

### 2. **About Drum Next Section**
- Description of your AI-native drumming app
- Link to YouTube channel
- Gradient card with hover effects

### 3. **Channel Stats** (if data available)
- Subscribers count
- Total views
- Total videos
- Beautiful gradient cards with icons

### 4. **Latest Videos** (up to 6)
- Video thumbnails
- Titles
- View counts
- Upload dates
- Duration badges
- Hover effects and animations
- Links to YouTube

### 5. **Shorts** (up to 12)
- Vertical thumbnail layout
- Compact display
- View counts
- Hover effects
- Links to YouTube

### 6. **Last Updated**
- Shows when data was last fetched

## Translations

Both English and Chinese translations are included:

**English:**
- About Drum Next
- Channel Stats
- Latest Videos
- Shorts
- View on YouTube
- etc.

**Chinese:**
- 关于 Drum Next
- 频道统计
- 最新视频
- 短视频
- 在 YouTube 观看
- etc.

## Maintenance

### When to Update

Run the script to update YouTube data:
- After uploading new videos
- Weekly/monthly for fresh stats
- Before major site updates

### API Quota

- YouTube Data API has a daily quota: 10,000 units/day
- Each script run uses ~3-4 units
- You can run it hundreds of times per day

### Customization

To change the number of videos displayed:

**In `pages/drum.vue`:**
```vue
<!-- Show 9 videos instead of 6 -->
<div v-for="video in youtubeData.videos.slice(0, 9)">

<!-- Show 18 shorts instead of 12 -->
<div v-for="short in youtubeData.shorts.slice(0, 18)">
```

**In `scripts/fetch-youtube-data.js`:**
```javascript
// Fetch more videos
const MAX_RESULTS = 100 // Default is 50
```

## Design System

The page follows your existing design system:

- **Gradient accents** - Blue → Purple → Pink
- **Section headers** - With gradient accent bars
- **Cards** - With hover effects and shadows
- **Responsive grid** - 1/2/3 columns for videos, 2/4/6 for shorts
- **Dark mode** - Full support
- **Icons** - Using `nuxt-icon` with Material Design icons

## Troubleshooting

### Script fails with "API key not set"
- Make sure `.env` file exists with `YOUTUBE_API_KEY`
- Or export it: `export YOUTUBE_API_KEY=your_key`

### No videos showing on page
- Run `npm run youtube:fetch` to generate data
- Check `data/youtube.json` has content
- Verify the JSON structure is correct

### TypeScript errors in IDE
- Normal if `youtube.json` is empty
- Run the fetch script to populate data
- Errors will disappear once data is present

## Next Steps

1. ✅ Get YouTube API key
2. ✅ Set up `.env` file
3. ✅ Run `npm run youtube:fetch`
4. ✅ Review generated data
5. ✅ Commit and push
6. ✅ Deploy and enjoy!

---

**Questions?** Check `scripts/README.md` for more details about the fetch script.

