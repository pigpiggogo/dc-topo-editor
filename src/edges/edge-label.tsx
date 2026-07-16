import type { ReactElement } from 'react'

export interface EdgeLabelProps {
  label?: string
  cableSpec?: string
  switchStatus?: 'open' | 'closed'
  voltage?: number
  x: number
  y: number
}

export function EdgeLabel(props: EdgeLabelProps): ReactElement {
  const { label, cableSpec, switchStatus, voltage, x, y } = props

  const hasContent = Boolean(label || cableSpec || switchStatus || voltage !== undefined && voltage !== 0)

  return (
    <div
      className="nodrag nopan pointer-events-none absolute px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
      style={{
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        border: '1px solid #475569',
        transform: 'translate(-50%, -50%)',
        left: x,
        top: y,
        display: hasContent ? 'block' : 'none',
        zIndex: 1000,
      }}
    >
      {label && <span className="mr-1">{label}</span>}
      {voltage !== undefined && voltage !== 0 && (
        <span className="text-yellow-400 mr-1">{voltage}V</span>
      )}
      {cableSpec && <span className="text-green-400 mr-1">{cableSpec}</span>}
      {switchStatus && (
        <span
          className={switchStatus === 'closed' ? 'text-blue-400' : 'text-red-400'}
        >
          {switchStatus === 'closed' ? '合闸' : '分闸'}
        </span>
      )}
    </div>
  )
}
