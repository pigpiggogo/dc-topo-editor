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
import { createBatteryDefaults, getBatteryPorts } from '../../types/devices/battery.ts'
import { BatteryNode } from '../components/battery-node.tsx'

export class BatteryPlugin extends BaseDevicePlugin {
  readonly id = 'battery'
  readonly name = '储能电池'
  readonly category = 'power'
  readonly icon = BatteryNode as unknown as ComponentType
  nodeComponent = BatteryNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '储能电池' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 200 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 100 }))
    .addGroup(
      group(
        '储能参数',
        [
          numberField('容量', { unit: 'kWh', min: 0, defaultValue: 200 }),
          numberField('SOC', { unit: '%', min: 0, max: 100, defaultValue: 50 }),
          numberField('最大充电功率', { unit: 'kW', min: 0, defaultValue: 100 }),
          numberField('最大放电功率', { unit: 'kW', min: 0, defaultValue: 100 }),
          numberField('循环寿命', { unit: '次', min: 0, integer: true, defaultValue: 6000 }),
          selectField('电化学类型', {
            options: [
              { label: '磷酸铁锂(LFP)', value: 'LFP' },
              { label: '三元锂(NCM)', value: 'NCM' },
              { label: '钛酸锂(LTO)', value: 'LTO' },
              { label: '钠离子', value: 'Na-ion' },
            ],
            defaultValue: 'LFP',
          }),
          numberField('放电深度', { unit: '%', min: 0, max: 100, defaultValue: 90 }),
          numberField('往返效率', { unit: '%', min: 0, max: 100, defaultValue: 95 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createBatteryDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getBatteryPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.capacity === 'number' && d.capacity > 0
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
