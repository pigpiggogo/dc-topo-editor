import type { ReactElement } from 'react'

export interface BusbarLabelProps {
  x: number
  y: number
  voltage?: number
  label?: string
}

export function BusbarLabel(props: BusbarLabelProps): ReactElement {
  const { x, y, voltage, label } = props

  const text = label && label.trim().length > 0 ? label : voltage !== undefined ? `${voltage}V` : '750V'

  return (
    <div
      className="nodrag nopan pointer-events-none absolute whitespace-nowrap"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        color: '#ffffff',
        fontSize: 33,
        fontWeight: 700,
        lineHeight: 1,
        WebkitTextStroke: '1px #1f2937',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
      }}
    >
      {text}
    </div>
  )
}
