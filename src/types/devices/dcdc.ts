import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface DCDCConverterParams extends BaseDeviceParams {
  inputVoltage: number // V
  outputVoltage: number // V
  maxPower: number // kW
  efficiency: number // %
  topology: 'buck' | 'boost' | 'buck-boost' | 'isolated'
  switchingFreq: number // kHz
  isolation: boolean
}

export function createDCDCDefaults(): DCDCConverterParams {
  return {
    name: 'DC/DC变换器',
    deviceType: 'dcdc_converter',
    category: 'converter' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 50,
    inputVoltage: 750,
    outputVoltage: 375,
    maxPower: 50,
    efficiency: 98,
    topology: 'buck-boost',
    switchingFreq: 50,
    isolation: false,
  }
}

export function getDCDCPorts(): PortDefinition[] {
  return createStandardPorts()
}
