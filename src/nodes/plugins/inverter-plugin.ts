import type { ComponentType } from 'react'
import type { IRegistry, PortDefinition } from '../../types/index.ts'
import { BaseDevicePlugin } from '../../core/plugin/base-device-plugin.ts'
import { createSchemaBuilder } from '../../core/schema/schema-builder.ts'
import {
  textField,
  numberField,
  group,
} from '../../core/schema/field-types.ts'
import { createInverterDefaults, getInverterPorts } from '../../types/devices/inverter.ts'
import { InverterNode } from '../components/inverter-node.tsx'

export class InverterPlugin extends BaseDevicePlugin {
  readonly id = 'inverter'
  readonly name = '逆变器'
  readonly category = 'converter' as const
  readonly icon = InverterNode as unknown as ComponentType
  nodeComponent = InverterNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '逆变器' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 100 }))
    .addGroup(
      group(
        '逆变参数',
        [
          numberField('转换效率', { unit: '%', min: 0, max: 100, defaultValue: 98 }),
          numberField('输出电压', { unit: 'V', min: 0, defaultValue: 380 }),
          numberField('输出频率', { unit: 'Hz', min: 0, defaultValue: 50 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createInverterDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getInverterPorts()
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
