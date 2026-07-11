# Note images

Notes can include an optional cover image in their frontmatter:

```yaml
image: /notes-img/your-note-slug.webp
alt: A concise, descriptive explanation of the image
```

Use a clean, high-resolution source at 2400 × 1350 (16:9) or larger. Keep the approved source in `public/notes-img/` as WebP. The site renders the image only through `NuxtImg`, which generates responsive WebP variants at quality 82 for the homepage, archive, and Note detail page.

The image is optional. When absent, a Note keeps the text-first treatment.
