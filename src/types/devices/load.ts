import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface LoadParams extends BaseDeviceParams {
  loadType: string
  powerFactor: number
  demandFactor: number
  priority: 'critical' | 'important' | 'normal' | 'deferrable'
  adjustable: boolean
  minPower: number // kW
  maxPower: number // kW
  dutyCycle: number // %
}

export function createLoadDefaults(): LoadParams {
  return {
    name: '直流负载',
    deviceType: 'load',
    category: 'load' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 50,
    ratedPower: 30,
    loadType: 'general',
    powerFactor: 1,
    demandFactor: 0.8,
    priority: 'normal',
    adjustable: false,
    minPower: 0,
    maxPower: 30,
    dutyCycle: 100,
  }
}

export function getLoadPorts(): PortDefinition[] {
  return createStandardPorts()
}
