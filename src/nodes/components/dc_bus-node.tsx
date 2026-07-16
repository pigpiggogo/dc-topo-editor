import type { NodeProps } from '@xyflow/react'
import { PortHandle } from './port-handle'
import { Minus } from 'lucide-react'
import type { ReactElement } from 'react'
import { getVoltageColor } from '@/constants/voltage-colors'
import type { PortDefinition } from '@/types'

const PORTS: PortDefinition[] = [
  { id: 'port-top', type: 'bidirectional', position: 'top' },
  { id: 'port-right', type: 'bidirectional', position: 'right' },
  { id: 'port-bottom', type: 'bidirectional', position: 'bottom' },
  { id: 'port-left', type: 'bidirectional', position: 'left' },
]

export function DCBusNode(props: NodeProps): ReactElement {
  const data = props.data as Record<string, unknown> | undefined
  const selected = props.selected

  const name = (data?.name as string) ?? '直流母线'
  const ratedVoltage = (data?.ratedVoltage as number) ?? 0
  const ratedCurrent = (data?.ratedCurrent as number) ?? 0
  const voltageLevel = (data?.voltageLevel as number) ?? ratedVoltage

  const voltageColor = getVoltageColor(voltageLevel)

  return (
    <div
      className="relative rounded-md border-2 shadow-sm overflow-hidden flex flex-col items-center justify-center text-center group"
      style={{
        width: 80,
        height: 96,
        borderColor: selected ? '#3b82f6' : '#94a3b8',
        backgroundColor: '#dbeafe',
      }}
    >
      {/* Voltage indicator */}
      <span
        className="absolute top-1 left-1 w-2 h-2 rounded-full"
        style={{ backgroundColor: voltageColor }}
      />

      {/* Icon */}
      <Minus className="w-5 h-5 mb-1" style={{ color: '#1e293b' }} />

      {/* Name */}
      <div
        className="text-[10px] font-medium px-1 leading-tight truncate w-full"
        style={{ color: '#1e293b' }}
      >
        {name}
      </div>

      {/* Key params */}
      <div className="text-[9px] mt-1 leading-tight" style={{ color: '#475569' }}>
        <div>
          {ratedVoltage}V / {ratedCurrent}A
        </div>
      </div>

      {/* Ports */}
      {PORTS.map((port) => (
        <PortHandle key={port.id} port={port} />
      ))}
    </div>
  )
}
