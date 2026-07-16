import type { IDevicePlugin } from '../../types/index.ts'

export interface PluginDependency {
  pluginId: string
  required: boolean
}

export interface IPluginManager {
  install(plugin: IDevicePlugin): void
  uninstall(pluginId: string): void
  getPlugin(id: string): IDevicePlugin | undefined
  getPluginsByCategory(category: string): IDevicePlugin[]
  getAllPlugins(): IDevicePlugin[]
  isInstalled(pluginId: string): boolean
}
