import type { NodeProps } from '@xyflow/react'
import type { ReactElement } from 'react'
import type { PortDefinition } from '@/types/index'
import { PortHandle } from './port-handle'
import { ArrowLeftRight } from 'lucide-react'
import { getVoltageColor } from '@/constants/voltage-colors'

interface DCDCNodeData {
  name?: string
  deviceType?: string
  category?: string
  ratedVoltage?: number
  ratedCurrent?: number
  ratedPower?: number
  inputVoltage?: number
  outputVoltage?: number
  efficiency?: number
  ports?: PortDefinition[]
}

export function DCDCNode(props: NodeProps): ReactElement {
  const data = props.data as DCDCNodeData | undefined
  const selected = props.selected

  const name = data?.name ?? 'DC/DC变换器'
  const ratedVoltage = data?.ratedVoltage ?? 0
  const inputVoltage = data?.inputVoltage ?? 0
  const outputVoltage = data?.outputVoltage ?? 0
  const efficiency = data?.efficiency ?? 0
  const ports = data?.ports ?? []

  const voltageColor = getVoltageColor(ratedVoltage)

  return (
    <div
      className="w-20 h-24 rounded-md border-2 shadow-sm overflow-hidden flex flex-col group"
      style={{
        borderColor: selected ? '#3b82f6' : '#94a3b8',
        backgroundColor: '#fef9c3',
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
        <ArrowLeftRight size={20} style={{ color: '#ca8a04' }} />
      </div>

      {/* Parameters */}
      <div className="px-1 py-0.5 text-[9px] space-y-0.5" style={{ color: '#334155' }}>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>Vin:</span>
          <span>{inputVoltage}V</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#64748b' }}>Vout:</span>
          <span>{outputVoltage}V</span>
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
