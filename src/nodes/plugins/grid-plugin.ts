import type { ComponentType } from 'react'
import type { IRegistry, PortDefinition } from '../../types/index.ts'
import { BaseDevicePlugin } from '../../core/plugin/base-device-plugin.ts'
import { createSchemaBuilder } from '../../core/schema/schema-builder.ts'
import {
  textField,
  numberField,
  group,
} from '../../core/schema/field-types.ts'
import { createGridDefaults, getGridPorts } from '../../types/devices/grid.ts'
import { GridNode } from '../components/grid-node.tsx'

export class GridPlugin extends BaseDevicePlugin {
  readonly id = 'grid'
  readonly name = '市电接入'
  readonly category = 'power' as const
  readonly icon = GridNode as unknown as ComponentType
  nodeComponent = GridNode as unknown as ComponentType<Record<string, unknown>>

  propertySchema = createSchemaBuilder()
    .addField('name', textField('设备名称', { defaultValue: '市电接入' }))
    .addField('ratedVoltage', numberField('额定电压', { unit: 'V', min: 0, defaultValue: 380 }))
    .addField('ratedCurrent', numberField('额定电流', { unit: 'A', min: 0, defaultValue: 200 }))
    .addField('ratedPower', numberField('额定功率', { unit: 'kW', min: 0, defaultValue: 1000 }))
    .addGroup(
      group(
        '电网参数',
        [
          numberField('电网电压', { unit: 'V', min: 0, defaultValue: 380 }),
          numberField('电网频率', { unit: 'Hz', min: 0, defaultValue: 50 }),
          numberField('短路容量', { unit: 'MVA', min: 0, defaultValue: 500 }),
        ],
        { collapsed: false },
      ),
    )
    .build()

  defaultData(): Record<string, unknown> {
    return { ...createGridDefaults() }
  }

  getPorts(): PortDefinition[] {
    return getGridPorts()
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
