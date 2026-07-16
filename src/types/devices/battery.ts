import type { PortDefinition, DeviceCategory } from '../index.ts'
import type { BaseDeviceParams } from './device-definitions.ts'
import { createStandardPorts } from './device-definitions.ts'

export interface BatteryParams extends BaseDeviceParams {
  capacity: number // kWh
  soc: number // % 荷电状态
  maxChargePower: number // kW
  maxDischargePower: number // kW
  cycleLife: number
  chemistry: string
  depthOfDischarge: number // %
  roundTripEfficiency: number // %
}

export function createBatteryDefaults(): BatteryParams {
  return {
    name: '储能电池',
    deviceType: 'battery',
    category: 'power' as DeviceCategory,
    ratedVoltage: 750,
    ratedCurrent: 200,
    ratedPower: 100,
    capacity: 200,
    soc: 50,
    maxChargePower: 100,
    maxDischargePower: 100,
    cycleLife: 6000,
    chemistry: 'LFP',
    depthOfDischarge: 90,
    roundTripEfficiency: 95,
  }
}

export function getBatteryPorts(): PortDefinition[] {
  return createStandardPorts()
}
