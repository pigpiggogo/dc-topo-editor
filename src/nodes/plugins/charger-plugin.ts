import type { ComponentType } from 'react'
import type { IRegistry, PortDefinition } from '../../types/index.ts'
import { BaseDevicePlugin } from '../../core/plugin/base-device-plugin.ts'
import { createSchemaBuilder } from '../../core/schema/schema-builder.ts'
import {
  textField,
  numberField,
  group,
} from '../../core/schema/field-types.ts'
import { createChargerDefaults, getChargerPorts } from '../../types/devices/charger.ts'
import { ChargerNode } from '../components/charger-node.tsx'

export class ChargerPlugin extends BaseDevicePlugin {
  readonly id = 'charger'
  readonly name = '充电桩'
  readonly category = 'load' as const
  readonly icon = ChargerNode as unknown as ComponentType
  nodeComponent = ChargerNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '充电桩' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 60 }))
    .addGroup(
      group(
        '充电参数',
        [
          numberField('输出电压', { unit: 'V', min: 0, defaultValue: 750 }),
          numberField('输出电流', { unit: 'A', min: 0, defaultValue: 80 }),
          numberField('转换效率', { unit: '%', min: 0, max: 100, defaultValue: 96 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createChargerDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getChargerPorts()
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
