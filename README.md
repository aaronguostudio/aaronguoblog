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
- **Dark Mode**: Deep blue background with teal accents

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
