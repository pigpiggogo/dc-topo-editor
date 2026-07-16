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
import { createMeterDefaults, getMeterPorts } from '../../types/devices/meter.ts'
import { MeterNode } from '../components/meter-node.tsx'

export class MeterPlugin extends BaseDevicePlugin {
  readonly id = 'meter'
  readonly name = '智能电表'
  readonly category = 'auxiliary' as const
  readonly icon = MeterNode as unknown as ComponentType
  nodeComponent = MeterNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '智能电表' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addGroup(
      group(
        '计量参数',
        [
          numberField('精度等级', { unit: '%', min: 0, max: 100, step: 0.1, defaultValue: 0.5 }),
          selectField('通信协议', {
            options: [
              { label: 'Modbus RTU', value: 'Modbus RTU' },
              { label: 'Modbus TCP', value: 'Modbus TCP' },
              { label: 'IEC 61850', value: 'IEC 61850' },
              { label: 'MQTT', value: 'MQTT' },
            ],
            defaultValue: 'Modbus RTU',
          }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createMeterDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getMeterPorts()
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
