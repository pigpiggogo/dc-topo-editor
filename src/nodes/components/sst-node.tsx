import type { NodeProps } from '@xyflow/react'
import type { ReactElement } from 'react'
import type { PortDefinition } from '@/types/index'
import { PortHandle } from './port-handle'
import { Cpu } from 'lucide-react'
import { getVoltageColor } from '@/constants/voltage-colors'

interface SSTNodeData {
  name?: string
  deviceType?: string
  category?: string
  ratedVoltage?: number
  ratedCurrent?: number
  ratedPower?: number
  primaryVoltage?: number
  secondaryVoltage?: number
  efficiency?: number
  ports?: PortDefinition[]
}

export function SSTNode(props: NodeProps): ReactElement {
  const data = props.data as SSTNodeData | undefined
  const selected = props.selected

  const name = data?.name ?? '固态变压器'
  const ratedVoltage = data?.ratedVoltage ?? 0
  const primaryVoltage = data?.primaryVoltage ?? 0
  const secondaryVoltage = data?.secondaryVoltage ?? 0
  const efficiency = data?.efficiency ?? 0
  const ports = data?.ports ?? []

  const voltageColor = getVoltageColor(ratedVoltage)

  return (
    <div
      className="w-20 h-24 rounded-md border-2 shadow-sm overflow-hidden flex flex-col group"
      style={{
        borderColor: selected ? '#3b82f6' : '#94a3b8',
        backgroundColor: '#dcfce7',
      }}
    >
      {/* Header with voltage indicator */}
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

      {/* Icon */}
      <div className="flex-1 flex items-center justify-center">
        <Cpu size={20} style={{ color: '#16a34a' }} />
      </div>

      {/* Parameters */}
      <div className="px-1 py-0.5 text-[9px] space-y-0.5" style={{ color: '#334155' }}>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>Vp:</span>
          <span>{primaryVoltage}V</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>Vs:</span>
          <span>{secondaryVoltage}V</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>η:</span>
          <span>{efficiency}%</span>
        </div>
      </div>

      {/* Ports */}
      {ports.map((port) => (
        <PortHandle key={port.id} port={port} />
      ))}
    </div>
  )
}
