import type { NodeProps } from '@xyflow/react'
import type { PortDefinition } from '@/types/index'
import { PortHandle } from './port-handle'
import type { LucideIcon } from 'lucide-react'
import { getVoltageColor } from '@/constants/voltage-colors'

interface GenericDeviceNodeData {
  name?: string
  deviceType?: string
  category?: string
  ratedVoltage?: number
  ratedCurrent?: number
  ratedPower?: number
  ports?: PortDefinition[]
}

interface GenericDeviceNodeProps extends NodeProps {
  icon: LucideIcon
  accentColor: string
  iconColor: string
  defaultLabel: string
}

export function GenericDeviceNode({
  data,
  selected,
  icon: Icon,
  accentColor,
  iconColor,
  defaultLabel,
}: GenericDeviceNodeProps): JSX.Element {
  const nodeData = data as GenericDeviceNodeData | undefined

  const name = nodeData?.name ?? defaultLabel
  const ratedVoltage = nodeData?.ratedVoltage ?? 0
  const ratedPower = nodeData?.ratedPower ?? 0
  const ports = nodeData?.ports ?? []

  const voltageColor = getVoltageColor(ratedVoltage)

  return (
    <div
      className="w-20 h-24 rounded-md border-2 shadow-sm overflow-hidden flex flex-col group"
      style={{
        borderColor: selected ? '#3b82f6' : '#94a3b8',
        backgroundColor: accentColor,
      }}
    >
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

      <div className="flex-1 flex items-center justify-center">
        <Icon size={20} style={{ color: iconColor }} />
      </div>

      <div className="px-1 py-0.5 text-[9px] space-y-0.5" style={{ color: '#334155' }}>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>V:</span>
          <span>{ratedVoltage}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>P:</span>
          <span>{ratedPower}kW</span>
        </div>
      </div>

      {ports.map((port) => (
        <PortHandle key={port.id} port={port} />
      ))}
    </div>
  )
}
