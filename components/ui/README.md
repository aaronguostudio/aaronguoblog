# UI Components Library

Reusable Vue components following the Aaron Guo Blog design system.

## Components

### UiPageHeader

Page header with gradient background and frosted glass effect.

**Props:**
- `title` (string, required) - Page title
- `description` (string, optional) - Page description
- `icon` (string, optional) - Emoji icon to display

**Usage:**
```vue
<UiPageHeader 
  title="Writing" 
  description="Thoughts on AI, execution, leadership, and building products"
/>

<!-- With icon -->
<UiPageHeader 
  title="Drum" 
  description="My drumming journey"
  icon="🥁"
/>
```

---

### UiSectionHeader

Section header with gradient accent bar and gradient text.

**Props:**
- `title` (string, required) - Section title
- `size` ('sm' | 'md' | 'lg' | 'xl', default: 'md') - Header size

**Usage:**
```vue
<UiSectionHeader title="Featured Posts" size="lg" />
<UiSectionHeader title="About Me" />
```

---

### UiCard

Flexible card component with multiple variants.

**Props:**
- `variant` ('default' | 'gradient' | 'accent', default: 'default') - Card style
- `hover` (boolean, default: true) - Enable hover effects

**Usage:**
```vue
<!-- Default card -->
<UiCard>
  <h3>Card Title</h3>
  <p>Card content</p>
</UiCard>

<!-- Gradient background card -->
<UiCard variant="gradient">
  <h3>Highlighted Content</h3>
</UiCard>

<!-- Card with decorative accent -->
<UiCard variant="accent">
  <h3>Special Section</h3>
</UiCard>

<!-- Card without hover effect -->
<UiCard :hover="false">
  <p>Static content</p>
</UiCard>
```

---

### UiBadge

Status badge with optional pulsing dot.

**Props:**
- `text` (string, required) - Badge text
- `pulse` (boolean, default: false) - Show pulsing dot
- `variant` ('blue' | 'purple' | 'pink' | 'gradient', default: 'blue') - Badge color

**Usage:**
```vue
<UiBadge text="3 selected" :pulse="true" variant="gradient" />
<UiBadge text="New" variant="blue" />
<UiBadge text="Featured" variant="purple" />
```

---

### UiButton

Button component with multiple variants and icon support.

**Props:**
- `variant` ('primary' | 'secondary' | 'ghost', default: 'primary') - Button style
- `size` ('sm' | 'md' | 'lg', default: 'md') - Button size
- `icon` (string, optional) - Heroicons icon name
- `iconPosition` ('left' | 'right', default: 'left') - Icon position
- `href` (string, optional) - External link URL
- `to` (string, optional) - Internal route path

**Usage:**
```vue
<!-- Primary button -->
<UiButton variant="primary" icon="heroicons:envelope">
  Subscribe
</UiButton>

<!-- Secondary button with right icon -->
<UiButton 
  variant="secondary" 
  icon="heroicons:arrow-right" 
  icon-position="right"
  to="/start"
>
  Start Here
</UiButton>

<!-- Ghost button -->
<UiButton variant="ghost" size="sm">
  Cancel
</UiButton>

<!-- External link -->
<UiButton href="https://example.com" icon="heroicons:link">
  Visit Site
</UiButton>
```

---

## Design Tokens

All components use the design system tokens defined in `DESIGN_SYSTEM.md`:

- **Gradients**: Blue → Purple → Pink
- **Spacing**: Consistent padding and gaps
- **Shadows**: Elevated with colored glows
- **Transitions**: 300ms duration
- **Border Radius**: `rounded-xl`, `rounded-2xl`

---

## Best Practices

1. **Always use these components** instead of creating custom styled elements
2. **Maintain consistency** by using the same variant across similar elements
3. **Test in dark mode** to ensure proper contrast
4. **Use semantic HTML** - components render appropriate elements
5. **Combine components** to create complex layouts

---

## Examples

### Page Layout
```vue
<template>
  <main class="container max-w-4xl mx-auto px-4 py-12">
    <UiPageHeader 
      title="My Page" 
      description="Page description"
    />
    
    <UiSectionHeader title="Section 1" size="lg" />
    
    <UiCard variant="accent">
      <p>Content here</p>
    </UiCard>
    
    <div class="flex gap-4 mt-6">
      <UiButton variant="primary" to="/action">
        Primary Action
      </UiButton>
      <UiButton variant="secondary">
        Secondary Action
      </UiButton>
    </div>
  </main>
</template>
```

---

For more details, see `DESIGN_SYSTEM.md` in the project root.

