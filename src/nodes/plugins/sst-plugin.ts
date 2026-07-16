import type { ComponentType } from 'react'
import type { IRegistry, PortDefinition } from '../../types/index.ts'
import { BaseDevicePlugin } from '../../core/plugin/base-device-plugin.ts'
import { createSchemaBuilder } from '../../core/schema/schema-builder.ts'
import {
  textField,
  numberField,
  selectField,
  group,
} from '../../core/schema/field-types.ts'
import { createSSTDefaults, getSSTPorts } from '../../types/devices/sst.ts'
import { SSTNode } from '../components/sst-node.tsx'

const PlaceholderNode: ComponentType = (): null => null

export class SSTPlugin extends BaseDevicePlugin {
  readonly id = 'sst'
  readonly name = '固态变压器'
  readonly category = 'power'
  readonly icon = PlaceholderNode
  nodeComponent = SSTNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '固态变压器' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 100 }))
    .addGroup(
      group(
        '固态变压器参数',
        [
          numberField('原边电压', { unit: 'V', min: 0, defaultValue: 10000 }),
          numberField('副边电压', { unit: 'V', min: 0, defaultValue: 750 }),
          numberField('开关频率', { unit: 'kHz', min: 0, defaultValue: 20 }),
          numberField('效率', { unit: '%', min: 0, max: 100, defaultValue: 97 }),
          selectField('是否隔离', {
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
            defaultValue: true,
          }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createSSTDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getSSTPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.primaryVoltage === 'number' && typeof d.secondaryVoltage === 'number'
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
