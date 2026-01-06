# 📸 Feature Images Guide

## Overview

Your blog now supports **optional feature images** for blog posts. Images are displayed conditionally:
- ✅ **With image**: Shows the feature image in blog detail page and blog list
- ✅ **Without image**: Clean, minimal layout with no image placeholder

## How to Use

### Option 1: Add a Feature Image

1. **Add your image** to the `/public/blogs-img/` folder
2. **Reference it in your blog post frontmatter**:

```markdown
---
title: Your Post Title
date: 5th Jan 2026
description: Your post description
image: /blogs-img/your-image.jpg
alt: Descriptive alt text for accessibility
ogImage: /blogs-img/your-image.jpg
tags: ['tag1', 'tag2']
published: true
---

Your content here...
```

### Option 2: No Feature Image (Minimal)

Simply **omit the `image`, `alt`, and `ogImage` fields**:

```markdown
---
title: Your Post Title
date: 5th Jan 2026
description: Your post description
tags: ['tag1', 'tag2']
published: true
---

Your content here...
```

The layout will automatically adjust to show a clean, text-focused design.

## Examples in Your Blog

### Posts WITH Images:
- **"Learn Graph DB - Neo4j"** (`8.learn-graph-db-neo4j.md`)
  - Uses: `/blogs-img/8.learn-graph-db-neo4j.jpg`
  
- **"A New Chapter"** (`9.a-new-chapter.md`)
  - Uses: `/blogs-img/blog5.jpg`

- **"What I Learned from The Almanack of Naval Ravikant"** (`12.naval-ravikant-specific-knowledge-responsibility-assets.md`)
  - Uses: `/blogs-img/blog3.jpg`

### Posts WITHOUT Images:
- **"Building a Web Search + AI Summary Tool"** (`10.openai-serp-api-web-search-ai-summary.md`)
  - No image fields - shows clean text layout

## Where Images Appear

Feature images are displayed in:
1. **Blog Detail Page** (`BlogHeader` component) - Large hero image at the top
2. **Blog List Page** (`ArchiveCard` component) - Thumbnail on the left side
3. **Featured/Recent Posts** (`BlogCard` component) - Top banner image

## Image Recommendations

### Size & Format
- **Recommended size**: 1200x630px (optimal for social sharing)
- **Minimum size**: 800x400px
- **Format**: JPG or PNG
- **File size**: Keep under 200KB for fast loading

### Sources for Images
- **Manual Upload**: Your own photos or graphics
- **AI-Generated**: 
  - [Midjourney](https://midjourney.com) - Artistic, high-quality
  - [DALL-E 3](https://openai.com/dall-e-3) - Conceptual images
  - [Ideogram](https://ideogram.ai) - Great for text-in-image
- **Stock Photos**: 
  - [Unsplash](https://unsplash.com) - Free, high-quality
  - [Pexels](https://pexels.com) - Free stock photos

## Technical Details

### Conditional Display Logic
Images are only shown when:
- The `image` field exists in frontmatter
- The image path is NOT the default fallback (`/blogs-img/blog.jpg`)
- The image path is NOT a placeholder (`#`)

### Responsive Behavior
- **Mobile**: Images stack vertically above content
- **Desktop**: 
  - Blog list: Image on left (3 columns), content on right (6 columns)
  - Blog detail: Full-width hero image
  - Featured cards: Full-width top banner

### Components Modified
- `pages/blogs/[blog].vue` - Blog detail page data
- `pages/blogs/[...blog].vue` - Blog detail page data (catch-all route)
- `components/blog/Header.vue` - Blog detail header with hero image
- `components/archive/card.vue` - Blog list card with thumbnail
- `components/blog/card.vue` - Featured/recent post card

## Tips

1. **Consistency**: Use similar aspect ratios for a cohesive look
2. **Alt Text**: Always provide descriptive alt text for accessibility
3. **OG Image**: Use the same image for `ogImage` for social sharing
4. **File Naming**: Use descriptive names like `post-title.jpg` instead of `img1.jpg`
5. **Optimization**: Compress images before uploading to improve page load speed

---

**Need help?** Check the example posts mentioned above to see how it works in practice! 🎨

