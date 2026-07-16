import type { NodeProps } from '@xyflow/react'
import { PortHandle } from './port-handle'
import { Sun } from 'lucide-react'
import type { ReactElement } from 'react'
import { getVoltageColor } from '@/constants/voltage-colors'
import type { PortDefinition } from '@/types'

interface PVPanelNodeData {
  name?: string
  deviceType?: string
  category?: string
  ratedVoltage?: number
  ratedCurrent?: number
  ratedPower?: number
  ports?: PortDefinition[]
}

const DEFAULT_PORTS: PortDefinition[] = [
  { id: 'port-top', type: 'bidirectional', position: 'top' },
  { id: 'port-right', type: 'bidirectional', position: 'right' },
  { id: 'port-bottom', type: 'bidirectional', position: 'bottom' },
  { id: 'port-left', type: 'bidirectional', position: 'left' },
]

export function PVPanelNode(props: NodeProps): ReactElement {
  const data = props.data as PVPanelNodeData
  const selected = props.selected

  const name = data.name ?? '光伏组件'
  const ratedVoltage = data.ratedVoltage ?? 0
  const ratedPower = data.ratedPower ?? 0

  const ports = data.ports ?? DEFAULT_PORTS
  const voltageColor = getVoltageColor(ratedVoltage)

  return (
    <div
      className="relative w-20 h-24 rounded-md border-2 shadow-sm flex flex-col items-center justify-center gap-1 overflow-hidden group"
      style={{
        borderColor: selected ? '#3b82f6' : '#94a3b8',
        backgroundColor: '#dcfce7',
      }}
    >
      {/* Voltage color indicator */}
      <div
        className="absolute top-1 left-1 w-2 h-2 rounded-full"
        style={{ backgroundColor: voltageColor }}
      />

      {/* Lucide icon */}
      <Sun className="w-5 h-5 text-green-700" />

      {/* Device name */}
      <div className="text-[10px] font-medium text-slate-800 text-center px-1 truncate w-full">
        {name}
      </div>

      {/* Key parameters */}
      <div className="text-[9px] text-slate-600 text-center leading-tight">
        <div>{ratedVoltage}V</div>
        <div>{ratedPower}kW</div>
      </div>

      {/* Ports */}
      {ports.map((port) => (
        <PortHandle key={port.id} port={port} />
      ))}
    </div>
  )
}
