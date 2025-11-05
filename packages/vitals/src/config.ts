import type { VitalsConfig } from './types.js'
import { loadConfig } from 'c12'

/**
 * Define Viper configuration with type safety
 *
 * @example
 * ```ts
 * // viper.config.ts
 * import { defineConfig } from 'viper'
 *
 * export default defineConfig({
 *   plugins: ['viper-plugin-vue'],
 *   rules: {
 *     'nested-loops': 'error',
 *     'no-console-log': 'off'
 *   }
 * })
 * ```
 */
export function defineConfig(config: VitalsConfig): VitalsConfig {
  return config
}

/**
 * Load Viper configuration from viper.config.ts/js/mjs
 */
export async function resolveConfig(cwd: string = process.cwd()): Promise<VitalsConfig> {
  const { config = {} } = await loadConfig<VitalsConfig>({
    cwd,
    name: 'viper',
    configFile: 'viper.config',
    defaults: {
      plugins: [],
      rules: {},
      reporters: ['console'],
      scanDeps: false,
      targetDeps: [],
    },
    // Support both .ts and .js config files
    rcFile: false,
    globalRc: false,
  })

  return config as VitalsConfig
}

/**
 * Merge CLI options with config file
 */
export function mergeConfig(
  fileConfig: VitalsConfig,
  cliOptions: Partial<VitalsConfig>
): VitalsConfig {
  return {
    ...fileConfig,
    ...cliOptions,
    plugins: cliOptions.plugins || fileConfig.plugins || [],
    rules: { ...fileConfig.rules, ...cliOptions.rules },
    reporters: cliOptions.reporters || fileConfig.reporters || ['console'],
    scanDeps: cliOptions.scanDeps ?? fileConfig.scanDeps ?? false,
    targetDeps: cliOptions.targetDeps || fileConfig.targetDeps || [],
  }
}
