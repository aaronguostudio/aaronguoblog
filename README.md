<h1 align="center">Aaron Guo's Official Blog</h1>

<p align="center">A personal blog built with Nuxt 3, Tailwind CSS, and Content module.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-3.16-00DC82?style=flat-square&logo=nuxt.js" alt="Nuxt 3" />
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
</p>

## ✨ Features

- 🌐 **Multilingual support** - English and Chinese
- 🌓 **Dark/Light mode** - Beautiful dark blue theme and light theme
- 📱 **Responsive design** - Mobile-first approach
- 📝 **Markdown content** - Write blog posts in Markdown
- 🔍 **Full-text search** - Search across all blog posts
- 🏷️ **Tag-based categorization** - Organize posts by tags
- 📊 **SEO optimization** - Meta tags, Open Graph, and more
- 🚀 **Fast performance** - Server-side rendering with Nuxt 3
- 📰 **RSS feed** - Automatically generated RSS feed

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Content**: [Nuxt Content](https://content.nuxtjs.org/)
- **Internationalization**: [Nuxt i18n](https://i18n.nuxtjs.org/)
- **Icons**: [Nuxt Icon](https://github.com/nuxt-modules/icon)

## 📂 Project Structure

```
official-blog/
├── app.vue                  # Main application entry
├── assets/                  # Static assets
│   └── css/                 # CSS files
│       ├── custom.css       # Custom CSS overrides
│       └── tailwind.css     # Tailwind CSS configuration
├── components/              # Vue components
│   ├── archive/             # Archive page components
│   ├── blog/                # Blog components
│   ├── category/            # Category components
│   ├── logo/                # Logo components
│   └── main/                # Main layout components
├── content/                 # Markdown content
│   ├── blogs/               # Blog posts
│   │   ├── en/              # English blog posts
│   │   └── zh/              # Chinese blog posts
├── layouts/                 # Layout components
├── locales/                 # Translation files
│   ├── en-US.json           # English translations
│   └── zh-CN.json           # Chinese translations
├── pages/                   # Application pages
│   ├── about.vue            # About page
│   ├── blogs/               # Blog pages
│   ├── categories/          # Category pages
│   └── index.vue            # Home page
├── public/                  # Public assets
├── utils/                   # Utility functions
│   ├── date.ts              # Date utilities
│   ├── seo.ts               # SEO utilities
│   └── type-guards.ts       # TypeScript type guards
├── nuxt.config.ts           # Nuxt configuration
└── tailwind.config.js       # Tailwind configuration
```

## 🎨 Design System

The project uses a consistent design system based on CSS variables defined in `assets/css/tailwind.css`. These variables are mapped to Tailwind classes in `tailwind.config.js`.

### Color Themes

- **Light Mode**: Clean white background with blue accents
- **Dark Mode**: Deep blue background with blue accents

### Typography

The typography scale is defined in `tailwind.config.js` with consistent sizing:

- `heading-1`: 2.5rem
- `heading-2`: 2rem
- `heading-3`: 1.5rem
- `heading-4`: 1.25rem
- `body-lg`: 1.125rem
- `body`: 1rem
- `body-sm`: 0.875rem
- `caption`: 0.75rem

## 📝 Content Management

### Blog Posts

Blog posts are written in Markdown and stored in the `content/blogs/` directory, organized by language:

- English posts: `content/blogs/en/`
- Chinese posts: `content/blogs/zh/`

Each blog post should include frontmatter with the following fields:

```markdown
---
title: 'Post Title'
date: '2023-05-15'
description: 'Brief description of the post'
image: '/images/post-image.jpg'
alt: 'Image description for accessibility'
ogImage: '/images/og-image.jpg'
tags: ['tag1', 'tag2']
published: true
---

Post content goes here...
```

## 📡 Radar 2.0

Radar 2.0 powers `/signal`. It runs `last30days`, normalizes public signals, writes structured records to Turso, and can export an SSG-friendly static snapshot for the blog build.

Radar is separate from long-form blog publishing: it does not write to `content/blogs`, publish RSS updates, or create newsletter/blog drafts. The public integration point is `public/radar/latest.json`, which lets `/signal` and the homepage Signal preview render during static generation.

List configured topics:

```bash
pnpm radar:topics
```

Run a local dry run without Turso writes:

```bash
pnpm radar:run --topic mobile-ai --dry-run
```

Run the daily cadence and write to Turso:

```bash
pnpm radar:run --cadence daily
```

The homepage's reader-facing conclusion is generated as a separate, source-bounded publishing step after the full daily batch has finished. It reads only the selected evidence records, must cite two or three of them, and is persisted before the static export; the browser never makes this model call. It is deliberately opt-in because enabling it adds at most one small model request per daily batch:

```bash
RADAR_DAILY_CONCLUSION_ENABLED=1 pnpm radar:conclude
```

Set `RADAR_DAILY_CONCLUSION_ENABLED=1` and optionally `OPENAI_DAILY_CONCLUSION_MODEL` in the dedicated local runner's Radar environment only after approving that recurring usage. If the conclusion is disabled, lacks sufficient evidence, or fails validation, the existing evidence-led pulse remains published instead.

On the weekly cadence, eligible important topics can be sent through Deep Reader. It selects topics with enough repeated, high-relevance evidence, produces a bilingual research artifact, and stores it in Turso for the Signal page. It does not create or publish a blog post:

```bash
pnpm radar:run --cadence weekly
pnpm radar:deep-read --max-topics 1
```

Deep Reader requires `OPENAI_API_KEY` and uses `OPENAI_DEEP_READER_MODEL` when set (default: `gpt-4.1-mini`). The current rollout is intentionally limited to the `coding-agents` thread; more Signal threads can opt in through topic configuration after this loop proves useful.

Export the latest Turso-backed Radar archive to static files:

```bash
pnpm radar:export
```

This writes:

```text
public/radar/latest.json
public/radar/daily/YYYY-MM-DD.json
```

The export blocks snapshots that contain fallback local-score summaries unless explicitly allowed:

```bash
pnpm radar:export --allow-local-ranking
```

Required runtime env/secrets are `TURSO_URL`, `TURSO_AUTH_TOKEN`, `LAST30DAYS_CLI`, and `LAST30DAYS_PYTHON`. Optional last30days source credentials include `BRAVE_API_KEY`, `SCRAPECREATORS_API_KEY`, `OPENAI_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, `PARALLEL_API_KEY`, `APIFY_API_TOKEN`, `AUTH_TOKEN`, `CT0`, `BSKY_HANDLE`, `BSKY_APP_PASSWORD`, and `TRUTHSOCIAL_TOKEN`.

Local scheduled publishing uses `scripts/radar/publish-local.sh`. It sources secrets from:

```text
$HOME/.config/aaronguo/radar.env
```

Then it pulls the repo, runs the daily Radar cadence, optionally produces one validated daily conclusion, runs the weekly cadence on Mondays, runs Deep Reader for one eligible topic, exports the static snapshot, verifies `pnpm run generate`, commits `public/radar`, pushes `main`, and verifies the deployed `/radar/latest.json` plus `/signal` page match the new snapshot. The local publisher refuses to run unless the checked-out branch is `main`; production changes therefore remain Git-triggered deployments of committed `main` revisions.

Deploy verification can be tuned with `RADAR_SITE_URL`, `RADAR_DEPLOY_VERIFY_ATTEMPTS`, and `RADAR_DEPLOY_VERIFY_DELAY_MS`. Set `RADAR_SKIP_DEPLOY_VERIFY=1` to skip the post-push check.

The production publisher is the Codex automation `Radar Local Publisher`, pointed at the dedicated local runner clone:

```text
/Users/aaronguo/Work/ag/blog/aaronguoblog-radar-runner
```

It runs daily at 07:30 local time and pushes Radar snapshots directly to `main`, which triggers the Vercel deploy.

As an alternative to Codex automation, install the macOS LaunchAgent:

```bash
scripts/radar/install-launch-agent.sh
```

It schedules `scripts/radar/publish-local.sh` for 07:30 local time and logs to:

```text
$HOME/Library/Logs/aaronguo-radar-publish.log
```

GitHub Actions keeps the `Radar` workflow as a manual fallback. Manual runs first apply the idempotent Radar migration, then execute the selected cadence:

```bash
pnpm radar:run --cadence daily
pnpm radar:run --cadence weekly
```

The workflow checks out `mvanhorn/last30days-skill` at reviewed commit `122158415ae421da83e739f2668032f6bc78d39c` instead of tracking a moving branch. Manual dispatch also supports a specific topic or cadence.

## 🚀 Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Tests

Run unit tests with:

```bash
npm test
```

## 🔧 Maintenance Guide

### Adding a New Blog Post

1. Create a new Markdown file in `content/blogs/en/` or `content/blogs/zh/`
2. Add the required frontmatter (title, date, description, etc.)
3. Write your content in Markdown
4. Set `published: true` when ready to publish

### Adding a New Page

1. Create a new Vue file in the `pages/` directory
2. Use the `useSeo` utility to add SEO metadata
3. Add translations for any text in `locales/en-US.json` and `locales/zh-CN.json`

### Updating the Design

1. Modify CSS variables in `assets/css/tailwind.css`
2. Extend the Tailwind theme in `tailwind.config.js` if needed
3. Add custom styles in `assets/css/custom.css`

### Adding New Features

1. Create new components in the appropriate directory
2. Use TypeScript for type safety
3. Follow the existing code structure and naming conventions
4. Add proper documentation

## 📋 Best Practices

- Use CSS variables for consistent theming
- Follow the component structure pattern
- Use TypeScript for better type safety
- Add JSDoc comments for functions and components
- Keep components small and focused
- Use utility functions for common operations
- Ensure all text is properly translated
- Test on different devices and browsers
