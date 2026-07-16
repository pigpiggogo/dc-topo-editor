import type { EdgeProps } from '@xyflow/react'
import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react'
import { useBoundStore } from '@/store'
import { getOrthogonalPathPoints, pointsToSvgPath, getPathMidpoint } from './orthogonal-router'
import { getVoltageColor } from '@/constants/voltage-colors'
import { EdgeLabel } from './edge-label'
import { EdgeToolbar } from './edge-toolbar'
import { registerEdgePath, unregisterEdgePath } from './edge-path-registry'

interface EdgeDataPayload {
  voltage?: number
  label?: string
  cableSpec?: string
  switchStatus?: 'open' | 'closed'
}

export function OrthogonalEdge(props: EdgeProps): ReactElement {
  const data = props.data as EdgeDataPayload | undefined
  const voltage = data?.voltage ?? 0
  const label = data?.label
  const cableSpec = data?.cableSpec
  const switchStatus = data?.switchStatus

  const sourceNode = useBoundStore.getState().getNodeById(props.source)
  const targetNode = useBoundStore.getState().getNodeById(props.target)
  const connectsToBranchPoint = sourceNode?.type === 'branch_point' || targetNode?.type === 'branch_point'

  const points = getOrthogonalPathPoints({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    offset: connectsToBranchPoint ? 0 : 20,
  })

  const edgePath = pointsToSvgPath(points)
  const color = getVoltageColor(voltage)
  const strokeWidth = props.selected ? 3 : 2

  const midPoint = getPathMidpoint(points)

  useEffect(() => {
    registerEdgePath(props.id, points)
    return () => {
      unregisterEdgePath(props.id)
    }
  }, [props.id, points])

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
      <EdgeLabelRenderer>
        <EdgeLabel
          label={label}
          cableSpec={cableSpec}
          switchStatus={switchStatus}
          x={midPoint.x}
          y={midPoint.y}
        />
      </EdgeLabelRenderer>
      {props.selected && (
        <EdgeLabelRenderer>
          <EdgeToolbar edgeId={props.id} x={midPoint.x} y={midPoint.y} />
        </EdgeLabelRenderer>
      )}
    </>
  )
}
