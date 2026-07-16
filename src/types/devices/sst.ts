import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface SSTParams extends BaseDeviceParams {
  primaryVoltage: number // V
  secondaryVoltage: number // V
  switchingFreq: number // kHz
  efficiency: number // %
  isolation: boolean
}

export function createSSTDefaults(): SSTParams {
  return {
    name: '固态变压器',
    deviceType: 'sst',
    category: 'power' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 100,
    primaryVoltage: 10000,
    secondaryVoltage: 750,
    switchingFreq: 20,
    efficiency: 97,
    isolation: true,
  }
}

export function getSSTPorts(): PortDefinition[] {
  return createStandardPorts()
}
