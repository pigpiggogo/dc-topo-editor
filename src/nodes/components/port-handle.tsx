import type { PortDefinition } from '@/types'
import { Handle, Position } from '@xyflow/react'

const POSITION_MAP: Record<string, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
}

const HANDLE_COLORS: Record<string, string> = {
  input: '#3b82f6',
  output: '#10b981',
  bidirectional: '#f59e0b',
}

interface PortHandleProps {
  port: PortDefinition
}

export function PortHandle({ port }: PortHandleProps): JSX.Element {
  const handlePosition = POSITION_MAP[port.position] ?? Position.Left
  const handleColor = HANDLE_COLORS[port.type] ?? '#f59e0b'

  const handleStyle = {
    width: 10,
    height: 10,
    backgroundColor: handleColor,
    border: '2px solid #0f172a',
  }

  const handleClassName = 'opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200'

  return (
    <Handle
      id={port.id}
      type="source"
      position={handlePosition}
      isConnectableStart={true}
      isConnectableEnd={true}
      style={handleStyle}
      className={handleClassName}
    />
  )
}
