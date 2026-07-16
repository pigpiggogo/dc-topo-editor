import type { EdgeProps } from '@xyflow/react'
import type { ReactElement } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import { getVoltageColor } from '@/constants/voltage-colors'

interface EdgeData {
  voltage?: number
  style?: string
  label?: string
}

export function EdgeRenderer(props: EdgeProps): ReactElement {
  const data = props.data as EdgeData | undefined
  const voltage = data?.voltage ?? 0
  const label = data?.label

  const color = getVoltageColor(voltage)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })

  const strokeWidth = props.selected ? 3 : 2

  return (
    <>
      <BaseEdge
        id={props.id}
        path={edgePath}
        markerEnd={props.markerEnd}
        style={{
          ...props.style,
          stroke: color,
          strokeWidth,
          filter: props.selected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))' : undefined,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute px-1 py-0.5 rounded text-[10px] font-medium"
            style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              border: `1px solid ${color}`,
              transform: 'translate(-50%, -50%)',
              left: labelX,
              top: labelY,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
