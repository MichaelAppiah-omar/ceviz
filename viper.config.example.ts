import { defineConfig } from 'viper'

export default defineConfig({
  // Load custom plugins
  plugins: [
    // From npm
    // 'viper-plugin-vue',
    // 'viper-plugin-react',

    // From local file
    // './viper-plugins/my-custom-plugin.js',
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
