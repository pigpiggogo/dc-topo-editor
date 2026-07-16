import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface SSCBParams extends BaseDeviceParams {
  breakingCapacity: number // kA
  ratedCurrent: number // A
  responseTime: number // ms
  status: 'open' | 'closed'
  tripCurrent: number // A
  resetType: 'manual' | 'automatic'
}

export function createSSCBDefaults(): SSCBParams {
  return {
    name: '固态断路器',
    deviceType: 'sscb',
    category: 'distribution' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 250,
    ratedPower: 0,
    breakingCapacity: 10,
    responseTime: 1,
    status: 'closed',
    tripCurrent: 300,
    resetType: 'manual',
  }
}

export function getSSCBPorts(): PortDefinition[] {
  return createStandardPorts()
}
