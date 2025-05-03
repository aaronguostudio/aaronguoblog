/**
 * Tailwind CSS configuration
 *
 * This file configures Tailwind CSS for the project, including:
 * - Dark mode configuration
 * - Content paths for purging unused CSS
 * - Theme extensions for colors, typography, spacing, etc.
 * - Custom plugins
 */

module.exports = {
  darkMode: 'class',
  // Content paths are handled by the Nuxt Tailwind module
  // But we add them here for better IDE support
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  // Enable JIT mode for better performance
  mode: 'jit',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Typography scale for consistent text sizing
      fontSize: {
        'heading-1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.5' }],
      },
      // Map CSS variables to Tailwind colors
      colors: {
        // Base colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // Component colors
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',

        // UI colors
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',

        // Functional colors
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      // Border radius
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      // Spacing
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
      },
      // Typography plugin customization
      typography: () => ({
        DEFAULT: {
          css: {
            color: 'var(--foreground)',
            // Link styling
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary)',
                opacity: '0.8',
              },
              textDecoration: 'none',
              fontWeight: '500',
              // Special styling for hash links (internal links)
              '&[href^="#"]': {
                color: 'var(--foreground)',
                fontWeight: '600',
                '&:hover': {
                  color: 'var(--foreground)',
                  opacity: '0.8',
                },
              },
            },
            // Headings
            h1: {
              color: 'var(--foreground)',
              fontWeight: '700',
            },
            h2: {
              color: 'var(--foreground)',
              fontWeight: '700',
              scrollMarginTop: '5rem',
            },
            h3: {
              color: 'var(--foreground)',
              fontWeight: '600',
              scrollMarginTop: '5rem',
            },
            h4: {
              color: 'var(--foreground)',
              fontWeight: '600',
              scrollMarginTop: '5rem',
            },
            // Inline code
            code: {
              color: 'var(--primary)',
              backgroundColor: 'var(--muted)',
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875em',
              fontWeight: '500',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            // Code blocks - always dark regardless of theme
            pre: {
              backgroundColor: '#1e293b', // Slate 800 - dark background for all modes
              color: '#e2e8f0', // Slate 200 - light text for all modes
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              overflowX: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875em',
              lineHeight: '1.7',
              fontWeight: '400',
              code: {
                backgroundColor: 'transparent',
                color: 'inherit',
                padding: '0',
                fontWeight: 'inherit',
                fontSize: 'inherit',
              },
            },
            // Blockquotes
            blockquote: {
              borderLeftColor: 'var(--border)',
              color: 'var(--muted-foreground)',
              fontStyle: 'italic',
              paddingLeft: '1rem',
            },
            // Horizontal rule
            hr: {
              borderColor: 'var(--border)',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            // Strong text
            strong: {
              color: 'var(--foreground)',
              fontWeight: '600',
            },
            // Tables
            table: {
              fontSize: '0.875em',
            },
            // Lists
            ul: {
              paddingLeft: '1.625em',
            },
            ol: {
              paddingLeft: '1.625em',
            },
            // Images
            img: {
              borderRadius: 'var(--radius-md)',
            },
          },
        },
        dark: {
          css: {
            color: 'var(--foreground)',
            // No need to override pre styles as they're now consistent in both modes
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class', // Only apply form styles to elements with specific classes
    }),
  ],
}
