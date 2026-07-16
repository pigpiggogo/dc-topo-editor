import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface InverterParams extends BaseDeviceParams {
  efficiency: number // %
  outputVoltage: number // V
  outputFrequency: number // Hz
}

export function createInverterDefaults(): InverterParams {
  return {
    name: '逆变器',
    deviceType: 'inverter',
    category: 'converter' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 100,
    efficiency: 98,
    outputVoltage: 380,
    outputFrequency: 50,
  }
}

export function getInverterPorts(): PortDefinition[] {
  return createStandardPorts()
}
