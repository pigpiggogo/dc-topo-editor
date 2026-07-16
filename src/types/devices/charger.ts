import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface ChargerParams extends BaseDeviceParams {
  outputVoltage: number // V
  outputCurrent: number // A
  efficiency: number // %
}

export function createChargerDefaults(): ChargerParams {
  return {
    name: '充电桩',
    deviceType: 'charger',
    category: 'load' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 60,
    outputVoltage: 750,
    outputCurrent: 80,
    efficiency: 96,
  }
}

export function getChargerPorts(): PortDefinition[] {
  return createStandardPorts()
}
