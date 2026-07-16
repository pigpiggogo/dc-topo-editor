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
import { createLoadDefaults, getLoadPorts } from '../../types/devices/load.ts'
import { LoadNode } from '../components/load-node.tsx'

export class LoadPlugin extends BaseDevicePlugin {
  readonly id = 'load'
  readonly name = '直流负载'
  readonly category = 'load'
  readonly icon = LoadNode as unknown as ComponentType
  nodeComponent = LoadNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '直流负载' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 50 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 30 }))
    .addGroup(
      group(
        '负载参数',
        [
          selectField('负载类型', {
            options: [
              { label: '通用', value: 'general' },
              { label: '充电桩', value: 'charger' },
              { label: '空调', value: 'hvac' },
              { label: '照明', value: 'lighting' },
              { label: 'IT设备', value: 'it' },
              { label: '工业', value: 'industrial' },
            ],
            defaultValue: 'general',
          }),
          numberField('功率因数', { min: 0, max: 1, step: 0.01, defaultValue: 1 }),
          numberField('需求系数', { min: 0, max: 1, step: 0.01, defaultValue: 0.8 }),
          selectField('优先级', {
            options: [
              { label: '关键', value: 'critical' },
              { label: '重要', value: 'important' },
              { label: '一般', value: 'normal' },
              { label: '可延迟', value: 'deferrable' },
            ],
            defaultValue: 'normal',
          }),
          selectField('可调节', {
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
            defaultValue: false,
          }),
          numberField('最小功率', { unit: 'kW', min: 0, defaultValue: 0 }),
          numberField('最大功率', { unit: 'kW', min: 0, defaultValue: 30 }),
          numberField('占空比', { unit: '%', min: 0, max: 100, defaultValue: 100 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createLoadDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getLoadPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.maxPower === 'number' && d.maxPower >= 0
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
