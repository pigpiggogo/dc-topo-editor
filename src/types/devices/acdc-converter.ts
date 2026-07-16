import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface ACDCConverterParams extends BaseDeviceParams {
  acVoltage: number // V
  dcVoltage: number // V
  frequency: number // Hz
  efficiency: number // %
  topology: 'buck' | 'boost' | 'buck-boost'
}

export function createACDCConverterDefaults(): ACDCConverterParams {
  return {
    name: 'AC/DC变换器',
    deviceType: 'acdc_converter',
    category: 'power' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 100,
    acVoltage: 380,
    dcVoltage: 750,
    frequency: 50,
    efficiency: 97,
    topology: 'buck-boost',
  }
}

export function getACDCConverterPorts(): PortDefinition[] {
  return createStandardPorts()
}
