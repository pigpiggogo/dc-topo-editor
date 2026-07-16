import type { EdgeProps } from '@xyflow/react'
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react'
import type { ReactElement } from 'react'
import { useEffect, useMemo } from 'react'
import { useBoundStore } from '@/store'
import { getBusbarPathPoints, pointsToSvgPath, getBusbarPathMidpoint } from './busbar-router'
import { getBusbarPortOffset } from './busbar-port-fanout'
import { BusbarLabel } from './busbar-label'
import { EdgeToolbar } from './edge-toolbar'
import { registerEdgePath, unregisterEdgePath } from './edge-path-registry'

const BUSBAR_COLOR = '#FF6B35'

function isBranchPoint(nodeId: string): boolean {
  return useBoundStore.getState().getNodeById(nodeId)?.type === 'branch_point'
}

export function BusbarEdge(props: EdgeProps): ReactElement {
  const data = props.data as { voltage?: number; label?: string; cableSpec?: string } | undefined
  const sourceIsBranch = isBranchPoint(props.source)
  const targetIsBranch = isBranchPoint(props.target)

  const sourceOffset = sourceIsBranch
    ? { dx: 0, dy: 0 }
    : getBusbarPortOffset(props.source, props.sourceHandleId ?? undefined, props.id)
  const targetOffset = targetIsBranch
    ? { dx: 0, dy: 0 }
    : getBusbarPortOffset(props.target, props.targetHandleId ?? undefined, props.id)

  const sourceX = props.sourceX + sourceOffset.dx
  const sourceY = props.sourceY + sourceOffset.dy
  const targetX = props.targetX + targetOffset.dx
  const targetY = props.targetY + targetOffset.dy

  const points = useMemo(
    () =>
      sourceIsBranch || targetIsBranch
        ? [
            { x: sourceX, y: sourceY },
            { x: targetX, y: targetY },
          ]
        : getBusbarPathPoints({
            sourceX,
            sourceY,
            sourcePosition: props.sourcePosition,
            targetX,
            targetY,
          }),
    [sourceIsBranch, targetIsBranch, sourceX, sourceY, targetX, targetY, props.sourcePosition],
  )

  const edgePath = pointsToSvgPath(points)
  const strokeWidth = props.selected ? 12 : 10
  const midPoint = getBusbarPathMidpoint(points)

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
          stroke: BUSBAR_COLOR,
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          filter: props.selected ? 'drop-shadow(0 0 5px rgba(255, 107, 53, 0.7))' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <BusbarLabel x={midPoint.x} y={midPoint.y} voltage={data?.voltage} label={data?.label} />
      </EdgeLabelRenderer>
      {props.selected && (
        <EdgeLabelRenderer>
          <EdgeToolbar edgeId={props.id} x={midPoint.x} y={midPoint.y} />
        </EdgeLabelRenderer>
      )}
    </>
  )
}
