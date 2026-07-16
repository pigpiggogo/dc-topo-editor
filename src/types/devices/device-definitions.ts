import type { PortDefinition, DeviceCategory } from '../index.ts'

export interface BaseDeviceParams {
  name: string
  deviceType: string
  category: DeviceCategory
  ratedVoltage: number
  ratedCurrent: number
  ratedPower: number
  description?: string
  manufacturer?: string
  model?: string
}

export interface BaseDeviceDefinition {
  deviceType: string
  category: DeviceCategory
  defaultParams: BaseDeviceParams
  defaultPorts: PortDefinition[]
  getPorts(): PortDefinition[]
  createDefaultParams(): BaseDeviceParams
}

export function createStandardPorts(): PortDefinition[] {
  return [
    { id: 'port-top', type: 'bidirectional', position: 'top' },
    { id: 'port-right', type: 'bidirectional', position: 'right' },
    { id: 'port-bottom', type: 'bidirectional', position: 'bottom' },
    { id: 'port-left', type: 'bidirectional', position: 'left' },
  ]
}

export function createBasePorts(
  inputs: number,
  outputs: number,
  bidirectional: number,
): PortDefinition[] {
  const ports: PortDefinition[] = []
  let id = 0

  for (let i = 0; i < inputs; i++) {
    ports.push({
      id: `port-${id++}`,
      type: 'input',
      position: 'left',
      offsetY: i * 20,
    })
  }

  for (let i = 0; i < outputs; i++) {
    ports.push({
      id: `port-${id++}`,
      type: 'output',
      position: 'right',
      offsetY: i * 20,
    })
  }

  for (let i = 0; i < bidirectional; i++) {
    ports.push({
      id: `port-${id++}`,
      type: 'bidirectional',
      position: 'top',
      offsetX: i * 20,
    })
  }

  return ports
}
