# YouTube Data Fetcher

This script fetches data from your YouTube channel and generates a static JSON file to power the Drum page.

## Setup

1. **Get a YouTube Data API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the YouTube Data API v3
   - Create credentials (API Key)
   - Copy the API key

2. **Set the API Key**
   
   Create a `.env` file in the root of the project (if it doesn't exist):
   ```bash
   YOUTUBE_API_KEY=your_api_key_here
   ```

   Or export it temporarily:
   ```bash
   export YOUTUBE_API_KEY=your_api_key_here
   ```

## Usage

Run the script to fetch the latest YouTube data:

```bash
npm run youtube:fetch
```

Or directly:

```bash
node scripts/fetch-youtube-data.js
```

## What it does

The script will:
1. Fetch channel statistics (subscribers, views, video count)
2. Fetch up to 50 latest videos
3. Separate videos into regular videos and shorts (≤60 seconds)
4. Save all data to `data/youtube.json`

## Output

The generated `data/youtube.json` file contains:

```json
{
  "channel": {
    "id": "...",
    "title": "...",
    "description": "...",
    "subscriberCount": 0,
    "videoCount": 0,
    "viewCount": 0
  },
  "videos": [...],
  "shorts": [...],
  "stats": {
    "totalVideos": 0,
    "regularVideosCount": 0,
    "shortsCount": 0
  },
  "metadata": {
    "fetchedAt": "2026-01-04T...",
    "channelId": "..."
  }
}
```

## Workflow

1. Run the script locally to fetch latest YouTube data
2. Review the generated `data/youtube.json` file
3. Commit and push the changes to Git
4. The Drum page will automatically display the updated content

## Frequency

Run this script whenever you want to update the Drum page with your latest videos:
- After uploading new videos
- Weekly/monthly to keep stats fresh
- Before deploying updates to your site

## Notes

- The script requires Node.js 18+ (for native fetch support)
- API quota: YouTube Data API has a daily quota limit (10,000 units/day)
- Each run uses approximately 3-4 units
- The channel ID is hardcoded in the script: `UCO_h81XNKntuUxUrem8gj1g`

