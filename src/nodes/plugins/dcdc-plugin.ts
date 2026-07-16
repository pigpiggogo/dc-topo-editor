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
import { createDCDCDefaults, getDCDCPorts } from '../../types/devices/dcdc.ts'
import { DCDCNode } from '../components/dcdc_converter-node.tsx'

const PlaceholderNode: ComponentType = (): null => null

export class DCDCPlugin extends BaseDevicePlugin {
  readonly id = 'dcdc_converter'
  readonly name = 'DC/DC变换器'
  readonly category = 'converter'
  readonly icon = PlaceholderNode
  nodeComponent = DCDCNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: 'DC/DC变换器' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 50 }))
    .addGroup(
      group(
        '变换器参数',
        [
          numberField('输入电压', { unit: 'V', min: 0, defaultValue: 750 }),
          numberField('输出电压', { unit: 'V', min: 0, defaultValue: 375 }),
          numberField('最大功率', { unit: 'kW', min: 0, defaultValue: 50 }),
          numberField('效率', { unit: '%', min: 0, max: 100, defaultValue: 98 }),
          selectField('拓扑结构', {
            options: [
              { label: 'Buck', value: 'buck' },
              { label: 'Boost', value: 'boost' },
              { label: 'Buck-Boost', value: 'buck-boost' },
              { label: '隔离型', value: 'isolated' },
            ],
            defaultValue: 'buck-boost',
          }),
          numberField('开关频率', { unit: 'kHz', min: 0, defaultValue: 50 }),
          selectField('是否隔离', {
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
            defaultValue: false,
          }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createDCDCDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getDCDCPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.inputVoltage === 'number' && typeof d.outputVoltage === 'number'
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
