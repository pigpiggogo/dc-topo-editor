import { createPluginManager } from '../../core/plugin/plugin-manager.ts'
import { PVPanelPlugin } from './pv-panel-plugin.ts'
import { BatteryPlugin } from './battery-plugin.ts'
import { SSCBPlugin } from './sscb-plugin.ts'
import { DCDCPlugin } from './dcdc-plugin.ts'
import { DCBusPlugin } from './dc-bus-plugin.ts'
import { LoadPlugin } from './load-plugin.ts'
import { RectifierPlugin } from './rectifier-plugin.ts'
import { InverterPlugin } from './inverter-plugin.ts'
import { ChargerPlugin } from './charger-plugin.ts'
import { MeterPlugin } from './meter-plugin.ts'
import { GridPlugin } from './grid-plugin.ts'
import { SSTPlugin } from './sst-plugin.ts'
import { ACDCConverterPlugin } from './acdc-converter-plugin.ts'

export function registerDefaultPlugins(): void {
  const manager = createPluginManager()

  manager.install(new PVPanelPlugin())
  manager.install(new BatteryPlugin())
  manager.install(new SSCBPlugin())
  manager.install(new DCDCPlugin())
  manager.install(new DCBusPlugin())
  manager.install(new LoadPlugin())
  manager.install(new RectifierPlugin())
  manager.install(new InverterPlugin())
  manager.install(new ChargerPlugin())
  manager.install(new MeterPlugin())
  manager.install(new GridPlugin())
  manager.install(new SSTPlugin())
  manager.install(new ACDCConverterPlugin())
}

export {
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
}
