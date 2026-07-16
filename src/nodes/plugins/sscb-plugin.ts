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
import { createSSCBDefaults, getSSCBPorts } from '../../types/devices/sscb.ts'
import { SSCBNode } from '../components/sscb-node.tsx'

const PlaceholderNode: ComponentType = (): null => null

export class SSCBPlugin extends BaseDevicePlugin {
  readonly id = 'sscb'
  readonly name = '固态断路器'
  readonly category = 'distribution'
  readonly icon = PlaceholderNode
  nodeComponent = SSCBNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '固态断路器' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 250 }))
    .addGroup(
      group(
        '保护参数',
        [
          numberField('分断容量', { unit: 'kA', min: 0, defaultValue: 10 }),
          numberField('响应时间', { unit: 'ms', min: 0, defaultValue: 1 }),
          selectField('开关状态', {
            options: [
              { label: '闭合', value: 'closed' },
              { label: '断开', value: 'open' },
            ],
            defaultValue: 'closed',
          }),
          numberField('跳闸电流', { unit: 'A', min: 0, defaultValue: 300 }),
          selectField('复位类型', {
            options: [
              { label: '手动', value: 'manual' },
              { label: '自动', value: 'automatic' },
            ],
            defaultValue: 'manual',
          }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createSSCBDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getSSCBPorts()
  }

  validate(data: unknown): boolean {
    if (!super.validate(data)) return false
    const d = data as Record<string, unknown>
    return typeof d.breakingCapacity === 'number' && d.breakingCapacity > 0
  }

  onInstall(registry: IRegistry<unknown>): void {
    void registry
  }
}
