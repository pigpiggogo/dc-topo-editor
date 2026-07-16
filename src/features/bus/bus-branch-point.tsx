import type { ReactElement } from 'react'
import { Handle, Position } from '@xyflow/react'

export interface BusBranchPointProps {
  x: number
  y: number
  id: string
  orientation: 'horizontal' | 'vertical'
}

const BASE_HANDLE_STYLE = {
  position: 'absolute' as const,
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 12,
  height: 12,
  backgroundColor: '#f59e0b',
  border: '2px solid #0f172a',
  zIndex: 10,
}

export function BusBranchPoint(props: BusBranchPointProps): ReactElement {
  const { x, y, id, orientation } = props

  return (
    <div className="absolute group" style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 5 }}>
      <div
        className="rounded-full border-2 border-white"
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#f59e0b',
        }}
      />
      <Handle
        id={id}
        type="source"
        position={orientation === 'horizontal' ? Position.Top : Position.Left}
        isConnectableStart={true}
        isConnectableEnd={true}
        className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200"
        style={BASE_HANDLE_STYLE}
      />
    </div>
  )
}
