import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface DCBusParams extends BaseDeviceParams {
  voltageLevel: number // V
  ratedCurrent: number // A
  busType: 'positive' | 'negative' | 'bipolar'
  length: number // m
  numBranches: number
}

export function createDCBusDefaults(): DCBusParams {
  return {
    name: '直流母线',
    deviceType: 'dc_bus',
    category: 'distribution' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 500,
    ratedPower: 0,
    voltageLevel: 750,
    busType: 'positive',
    length: 10,
    numBranches: 4,
  }
}

export function getDCBusPorts(): PortDefinition[] {
  return createStandardPorts()
}
