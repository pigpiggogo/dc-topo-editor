import type { ComponentType } from 'react'
import type { IRegistry, PortDefinition } from '../../types/index.ts'
import { BaseDevicePlugin } from '../../core/plugin/base-device-plugin.ts'
import { createSchemaBuilder } from '../../core/schema/schema-builder.ts'
import {
  textField,
  numberField,
  group,
} from '../../core/schema/field-types.ts'
import { createPVPanelDefaults, getPVPanelPorts } from '../../types/devices/pv-panel.ts'

import { PVPanelNode } from '../components/pv-panel-node.tsx'

const PlaceholderNode: ComponentType = (): null => null

export class PVPanelPlugin extends BaseDevicePlugin {
  readonly id = 'pv_panel'
  readonly name = '光伏组件'
  readonly category = 'power'
  readonly icon = PlaceholderNode
  nodeComponent = PVPanelNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '光伏组件' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 750 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 100 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 50 }))
    .addGroup(
      group(
        '光伏参数',
        [
          textField('峰值功率', { defaultValue: '50' }),
          numberField('开路电压', { unit: 'V', min: 0, defaultValue: 850 }),
          numberField('短路电流', { unit: 'A', min: 0, defaultValue: 120 }),
          numberField('组件数量', { unit: '块', min: 1, integer: true, defaultValue: 1 }),
          numberField('转换效率', { unit: '%', min: 0, max: 100, defaultValue: 22 }),
          numberField('倾斜角度', { unit: '°', min: 0, max: 90, defaultValue: 30 }),
          numberField('方位角', { unit: '°', min: 0, max: 360, defaultValue: 180 }),
          numberField('工作温度', { unit: '°C', min: -40, max: 85, defaultValue: 25 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createPVPanelDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getPVPanelPorts()
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
