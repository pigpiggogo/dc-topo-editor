import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface RectifierParams extends BaseDeviceParams {
  efficiency: number // %
  powerFactor: number
}

export function createRectifierDefaults(): RectifierParams {
  return {
    name: '整流器',
    deviceType: 'rectifier',
    category: 'converter' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 100,
    efficiency: 98,
    powerFactor: 0.99,
  }
}

export function getRectifierPorts(): PortDefinition[] {
  return createStandardPorts()
}
