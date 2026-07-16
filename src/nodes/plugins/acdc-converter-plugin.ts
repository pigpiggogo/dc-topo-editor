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
import { createACDCConverterDefaults, getACDCConverterPorts } from '../../types/devices/acdc-converter.ts'
import { ACDCConverterNode } from '../components/acdc-converter-node.tsx'

const PlaceholderNode: ComponentType = (): null => null

export class ACDCConverterPlugin extends BaseDevicePlugin {
  readonly id = 'acdc_converter'
  readonly name = 'AC/DC变换器'
  readonly category = 'power'
  readonly icon = PlaceholderNode
  nodeComponent = ACDCConverterNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: 'AC/DC变换器' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 100 }))
    .addGroup(
      group(
        'AC/DC参数',
        [
          numberField('交流电压', { unit: 'V', min: 0, defaultValue: 380 }),
          numberField('直流电压', { unit: 'V', min: 0, defaultValue: 750 }),
          numberField('频率', { unit: 'Hz', min: 0, defaultValue: 50 }),
          numberField('效率', { unit: '%', min: 0, max: 100, defaultValue: 97 }),
          selectField('拓扑结构', {
            options: [
              { label: 'Buck', value: 'buck' },
              { label: 'Boost', value: 'boost' },
              { label: 'Buck-Boost', value: 'buck-boost' },
            ],
            defaultValue: 'buck-boost',
          }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createACDCConverterDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getACDCConverterPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.acVoltage === 'number' && typeof d.dcVoltage === 'number'
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
