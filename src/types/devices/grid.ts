import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface GridParams extends BaseDeviceParams {
  gridVoltage: number // V
  gridFrequency: number // Hz
  shortCircuitCapacity: number // MVA
}

export function createGridDefaults(): GridParams {
  return {
    name: '市电接入',
    deviceType: 'grid',
    category: 'power' as DeviceCategory,
    ratedVoltage: 380,
    ratedCurrent: 200,
    ratedPower: 1000,
    gridVoltage: 380,
    gridFrequency: 50,
    shortCircuitCapacity: 500,
  }
}

export function getGridPorts(): PortDefinition[] {
  return createStandardPorts()
}
