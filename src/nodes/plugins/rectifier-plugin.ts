import type { ComponentType } from 'react'
import type { IRegistry, PortDefinition } from '../../types/index.ts'
import { BaseDevicePlugin } from '../../core/plugin/base-device-plugin.ts'
import { createSchemaBuilder } from '../../core/schema/schema-builder.ts'
import {
  textField,
  numberField,
  group,
} from '../../core/schema/field-types.ts'
import { createRectifierDefaults, getRectifierPorts } from '../../types/devices/rectifier.ts'
import { RectifierNode } from '../components/rectifier-node.tsx'

export class RectifierPlugin extends BaseDevicePlugin {
  readonly id = 'rectifier'
  readonly name = '整流器'
  readonly category = 'converter' as const
  readonly icon = RectifierNode as unknown as ComponentType
  nodeComponent = RectifierNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '整流器' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 100 }))
    .addGroup(
      group(
        '整流参数',
        [
          numberField('转换效率', { unit: '%', min: 0, max: 100, defaultValue: 98 }),
          numberField('功率因数', { min: 0, max: 1, step: 0.01, defaultValue: 0.99 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createRectifierDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getRectifierPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.ratedVoltage === 'number' && d.ratedVoltage > 0
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
