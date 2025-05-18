// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/html-self-closing': 'off',
    },
  },
  {
    // Disable no-explicit-any rule for test files
    files: ['**/tests/**/*.ts', '**/tests/**/*.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
