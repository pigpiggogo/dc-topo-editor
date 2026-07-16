import { createPluginManager } from '@/core/plugin/plugin-manager'
import {
  PVPanelPlugin,
  BatteryPlugin,
  SSCBPlugin,
  DCDCPlugin,
  DCBusPlugin,
  LoadPlugin,
  RectifierPlugin,
  InverterPlugin,
  ChargerPlugin,
  MeterPlugin,
  GridPlugin,
  SSTPlugin,
  ACDCConverterPlugin,
} from '@/nodes/plugins'

export const pluginManager = createPluginManager()

let initialized = false

export function initializeDefaultPlugins(): void {
  if (initialized) return

  const plugins = [
    new PVPanelPlugin(),
    new BatteryPlugin(),
    new SSCBPlugin(),
    new DCDCPlugin(),
    new DCBusPlugin(),
    new LoadPlugin(),
    new RectifierPlugin(),
    new InverterPlugin(),
    new ChargerPlugin(),
    new MeterPlugin(),
    new GridPlugin(),
    new SSTPlugin(),
    new ACDCConverterPlugin(),
  ]

  for (const plugin of plugins) {
    if (!pluginManager.isInstalled(plugin.id)) {
      pluginManager.install(plugin)
    }
  }

  initialized = true
}
