import type { IRegistry, IDevicePlugin } from '../../types/index.ts'
import { createRegistry } from '../registry/registry.ts'
import { createEventBus } from '../event-bus/event-bus.ts'
import type { PluginDependency, IPluginManager } from './types.ts'

export class PluginManager implements IPluginManager {
  private readonly registry: IRegistry<IDevicePlugin>
  private readonly dependencies: Map<string, PluginDependency[]>

  constructor() {
    this.registry = createRegistry<IDevicePlugin>()
    this.dependencies = new Map()
  }

  install(plugin: IDevicePlugin): void {
    if (this.registry.has(plugin.id)) {
      throw new Error(`PluginManager: plugin "${plugin.id}" is already installed`)
    }

    const deps = this.dependencies.get(plugin.id)
    if (deps !== undefined) {
      for (const dep of deps) {
        if (dep.required && !this.registry.has(dep.pluginId)) {
          throw new Error(
            `PluginManager: plugin "${plugin.id}" requires "${dep.pluginId}" which is not installed`,
          )
        }
      }
    }

    this.registry.register(plugin.id, plugin)
    plugin.onInstall(this.registry)

    const bus = createEventBus()
    bus.emit('plugin.installed', { pluginId: plugin.id })
  }

  uninstall(pluginId: string): void {
    if (!this.registry.has(pluginId)) {
      throw new Error(`PluginManager: plugin "${pluginId}" is not installed`)
    }

    for (const [id, deps] of this.dependencies.entries()) {
      if (id === pluginId) continue
      if (this.registry.has(id)) {
        for (const dep of deps) {
          if (dep.pluginId === pluginId && dep.required) {
            throw new Error(
              `PluginManager: cannot uninstall "${pluginId}" because "${id}" depends on it`,
            )
          }
        }
      }
    }

    this.registry.unregister(pluginId)
    const bus = createEventBus()
    bus.emit('plugin.uninstalled', { pluginId })
  }

  getPlugin(id: string): IDevicePlugin | undefined {
    return this.registry.get(id)
  }

  getPluginsByCategory(category: string): IDevicePlugin[] {
    return this.registry.filter((plugin) => plugin.category === category)
  }

  getAllPlugins(): IDevicePlugin[] {
    return this.registry.getAll()
  }

  isInstalled(pluginId: string): boolean {
    return this.registry.has(pluginId)
  }

  registerDependencies(pluginId: string, dependencies: PluginDependency[]): void {
    this.dependencies.set(pluginId, dependencies)
  }
}

export function createPluginManager(): IPluginManager {
  return new PluginManager()
}
