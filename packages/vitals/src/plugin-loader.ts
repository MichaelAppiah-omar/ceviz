import type { VitalsPlugin, PluginContext, Rule, Reporter, VitalsConfig, ProjectContext } from './types.js'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { createHooks } from 'hookable'
import type { Hookable } from 'hookable'

export interface VitalsHooks {
  'plugin:loading': (pluginName: string) => void
  'plugin:loaded': (plugin: VitalsPlugin) => void
  'rule:added': (rule: Rule) => void
  'reporter:added': (reporter: Reporter) => void
  'analysis:start': (context: ProjectContext) => void
  'analysis:file': (filePath: string) => void
  'analysis:complete': (issuesCount: number) => void
  'config:resolved': (config: VitalsConfig) => void
}

export class PluginLoader {
  private plugins: VitalsPlugin[] = []
  private rules: Rule[] = []
  private reporters: Reporter[] = []
  public hooks: Hookable<VitalsHooks>

  constructor() {
    this.hooks = createHooks<VitalsHooks>()
  }

  async loadPlugins(config: VitalsConfig, projectContext: ProjectContext): Promise<void> {
    if (!config.plugins || config.plugins.length === 0) {
      return
    }

    for (const plugin of config.plugins) {
      if (typeof plugin === 'string') {
        // Load plugin from package name or file path
        await this.loadPluginByPath(plugin, config, projectContext)
      } else {
        // Plugin object provided directly
        await this.registerPlugin(plugin, config, projectContext)
      }
    }
  }

  private async loadPluginByPath(
    pluginPath: string,
    config: VitalsConfig,
    projectContext: ProjectContext
  ): Promise<void> {
    try {
      await this.hooks.callHook('plugin:loading', pluginPath)

      let moduleSpecifier = pluginPath

      // If it's a relative path, resolve it
      if (pluginPath.startsWith('.')) {
        moduleSpecifier = pathToFileURL(resolve(projectContext.root, pluginPath)).href
      }

      const module = await import(moduleSpecifier)
      const plugin = module.default || module

      if (!this.isValidPlugin(plugin)) {
        console.warn(`⚠️  Invalid plugin: ${pluginPath}`)
        return
      }

      await this.registerPlugin(plugin, config, projectContext)
    } catch (error) {
      console.error(`❌ Failed to load plugin: ${pluginPath}`, error)
    }
  }

  private async registerPlugin(
    plugin: VitalsPlugin,
    config: VitalsConfig,
    projectContext: ProjectContext
  ): Promise<void> {
    const context: PluginContext = {
      addRule: (rule: Rule) => this.addRule(rule),
      addReporter: (reporter: Reporter) => this.addReporter(reporter),
      hooks: this.hooks,
      config,
      projectContext,
    }

    // Run plugin setup
    if (plugin.setup) {
      await plugin.setup(context)
    }

    // Register plugin rules
    if (plugin.rules) {
      for (const rule of plugin.rules) {
        this.addRule(rule)
      }
    }

    // Register plugin reporters
    if (plugin.reporters) {
      for (const reporter of plugin.reporters) {
        this.addReporter(reporter)
      }
    }

    this.plugins.push(plugin)
    await this.hooks.callHook('plugin:loaded', plugin)
    console.log(`✅ Plugin loaded: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ''}`)
  }

  private isValidPlugin(plugin: any): plugin is VitalsPlugin {
    return plugin && typeof plugin === 'object' && typeof plugin.name === 'string'
  }

  private addRule(rule: Rule): void {
    if (this.rules.find(r => r.id === rule.id)) {
      console.warn(`⚠️  Rule already exists: ${rule.id}, skipping...`)
      return
    }
    this.rules.push(rule)
    this.hooks.callHook('rule:added', rule)
  }

  private addReporter(reporter: Reporter): void {
    if (this.reporters.find(r => r.name === reporter.name)) {
      console.warn(`⚠️  Reporter already exists: ${reporter.name}, skipping...`)
      return
    }
    this.reporters.push(reporter)
    this.hooks.callHook('reporter:added', reporter)
  }

  getRules(): Rule[] {
    return this.rules
  }

  getReporters(): Reporter[] {
    return this.reporters
  }

  getPlugins(): VitalsPlugin[] {
    return this.plugins
  }
}
