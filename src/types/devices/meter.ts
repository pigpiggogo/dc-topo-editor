import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface MeterParams extends BaseDeviceParams {
  accuracy: number // %
  communicationProtocol: string
}

export function createMeterDefaults(): MeterParams {
  return {
    name: '智能电表',
    deviceType: 'meter',
    category: 'auxiliary' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 100,
    ratedPower: 0,
    accuracy: 0.5,
    communicationProtocol: 'Modbus RTU',
  }
}

export function getMeterPorts(): PortDefinition[] {
  return createStandardPorts()
}
