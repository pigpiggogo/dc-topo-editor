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
import { createDCBusDefaults, getDCBusPorts } from '../../types/devices/dc-bus.ts'
import { DCBusNode } from '../components/dc_bus-node.tsx'

const PlaceholderNode: ComponentType = (): null => null

export class DCBusPlugin extends BaseDevicePlugin {
  readonly id = 'dc_bus'
  readonly name = '直流母线'
  readonly category = 'distribution'
  readonly icon = PlaceholderNode
  nodeComponent = DCBusNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '直流母线' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 500 }))
    .addGroup(
      group(
        '母线参数',
        [
          numberField('电压等级', { unit: 'V', min: 0, defaultValue: 750 }),
          selectField('母线类型', {
            options: [
              { label: '正极', value: 'positive' },
              { label: '负极', value: 'negative' },
              { label: '双极', value: 'bipolar' },
            ],
            defaultValue: 'positive',
          }),
          numberField('长度', { unit: 'm', min: 0, defaultValue: 10 }),
          numberField('分支数', { unit: '个', min: 1, integer: true, defaultValue: 4 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createDCBusDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getDCBusPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.voltageLevel === 'number' && d.voltageLevel > 0
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
