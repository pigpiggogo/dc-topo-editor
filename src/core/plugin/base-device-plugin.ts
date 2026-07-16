import type { ComponentType } from 'react'
import type { IDevicePlugin, DeviceCategory, PortDefinition } from '../../types/index.ts'

export abstract class BaseDevicePlugin implements IDevicePlugin {
  abstract readonly id: string
  abstract readonly name: string
  abstract readonly category: DeviceCategory
  abstract readonly icon: ComponentType

  abstract nodeComponent: ComponentType<Record<string, unknown>>
  abstract propertySchema: unknown

  abstract defaultData(): Record<string, unknown>
  abstract getPorts(): PortDefinition[]

  validate(data: unknown): boolean {
    if (data === null || typeof data !== 'object') return false
    return true
  }

  onInstall(registry: unknown): void {
    void registry
  }
}
