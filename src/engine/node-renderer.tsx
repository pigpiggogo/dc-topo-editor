import type { NodeProps } from '@xyflow/react'
import type { ReactElement } from 'react'
import { PortHandle } from '@/nodes/components/port-handle'
import { pluginManager } from './plugin-instance'
import { getVoltageColor } from '@/constants/voltage-colors'

interface DeviceNodeData {
  name?: string
  deviceType?: string
  category?: string
  ratedVoltage?: number
  ratedCurrent?: number
  ratedPower?: number
}

export function NodeRenderer(props: NodeProps): ReactElement {
  const data = props.data as DeviceNodeData | undefined
  const selected = props.selected

  const deviceType = data?.deviceType ?? 'unknown'
  const category = data?.category ?? 'auxiliary'
  const name = data?.name ?? '未命名设备'
  const ratedVoltage = data?.ratedVoltage ?? 0

  const plugin = pluginManager.getPlugin(deviceType)
  const ports = plugin?.getPorts() ?? []

  const bgColor = (() => {
    const colors: Record<string, string> = {
      power: '#dcfce7',
      converter: '#fef9c3',
      distribution: '#dbeafe',
      load: '#fee2e2',
      auxiliary: '#f3e8ff',
    }
    return colors[category] ?? '#e2e8f0'
  })()

  const voltageColor = getVoltageColor(ratedVoltage)

  return (
    <div
      className="w-20 h-24 rounded-md border-2 shadow-sm overflow-hidden group"
      style={{
        borderColor: selected ? '#3b82f6' : '#94a3b8',
        backgroundColor: bgColor,
      }}
    >
      {/* Header */}
      <div
        className="px-1 py-0.5 text-[10px] font-medium border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#1e293b' }}
      >
        <span className="truncate">{name}</span>
        <span
          className="ml-0.5 w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: voltageColor }}
        />
      </div>

      {/* Body */}
      <div className="px-1 py-0.5 text-[9px] space-y-0.5" style={{ color: '#334155' }}>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>V:</span>
          <span>{ratedVoltage}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>I:</span>
          <span>{data?.ratedCurrent ?? 0}A</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>P:</span>
          <span>{data?.ratedPower ?? 0}kW</span>
        </div>
      </div>

      {/* Ports */}
      {ports.map((port) => (
        <PortHandle key={port.id} port={port} />
      ))}
    </div>
  )
}
