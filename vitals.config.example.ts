import { defineConfig } from '@vitals/analyzer'

export default defineConfig({
  // Load custom plugins
  plugins: [
    // From npm
    // 'vitals-plugin-vue',
    // 'vitals-plugin-react',

    // From local file
    // './vitals-plugins/my-custom-plugin.js',
  ],

  // Configure rules
  rules: {
    // Disable specific rules
    // 'no-console-log': 'off',

    // Change severity
    // 'nested-loops': 'warn',

    // Configure with options
    // 'array-find-in-loop': {
    //   severity: 'error',
    //   enabled: true,
    //   options: {
    //     threshold: 100
    //   }
    // }
  },

  // Output reporters
  reporters: ['console', 'json', 'html'],

  // Framework analysis mode
  scanDeps: false,

  // Target dependencies to scan (when scanDeps is true)
  targetDeps: [
    // 'nuxt',
    // '@nuxt/*',
    // 'vite',
    // 'vue',
  ],
})
