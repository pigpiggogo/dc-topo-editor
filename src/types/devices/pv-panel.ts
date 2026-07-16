import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface PVPanelParams extends BaseDeviceParams {
  peakPower: number // kW
  voc: number // V 开路电压
  isc: number // A 短路电流
  panelCount: number
  efficiency: number // %
  tiltAngle: number // 度
  azimuth: number // 度
  temperature: number // °C
}

export function createPVPanelDefaults(): PVPanelParams {
  return {
    name: '光伏组件',
    deviceType: 'pv_panel',
    category: 'power' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 50,
    peakPower: 50,
    voc: 850,
    isc: 120,
    panelCount: 1,
    efficiency: 22,
    tiltAngle: 30,
    azimuth: 180,
    temperature: 25,
  }
}

export function getPVPanelPorts(): PortDefinition[] {
  return createStandardPorts()
}
