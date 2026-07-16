import type { ConnectionLineComponentProps } from '@xyflow/react'
import { useViewport } from '@xyflow/react'
import type { ReactElement } from 'react'
import { useEffect, useMemo } from 'react'
import { findNearestEdgeSnap, setActiveSnap, clearActiveSnap } from './edge-snap'
import { getOrthogonalPathPoints, pointsToSvgPath } from './orthogonal-router'
import { getBusbarPathPoints, getBusbarPathMidpoint } from './busbar-router'
import { getProspectiveBusbarPortOffset } from './busbar-port-fanout'

const FREE_DRAWING_TYPES = new Set(['sst', 'acdc_converter', 'grid'])
const BUSBAR_COLOR = '#FF6B35'
const BUSBAR_STROKE_WIDTH = 10
const BUSBAR_THRESHOLD_SCREEN = 16

export function SnappedConnectionLine(props: ConnectionLineComponentProps): ReactElement {
  const { fromX, fromY, fromPosition, toX, toY, fromNode, fromHandle, toNode, toHandle } = props
  const { zoom } = useViewport()

  const isFreeDrawing = FREE_DRAWING_TYPES.has(fromNode?.type ?? '')
  const straightThreshold = BUSBAR_THRESHOLD_SCREEN / zoom

  const sourceOffset = isFreeDrawing
    ? getProspectiveBusbarPortOffset(fromNode?.id ?? '', fromHandle?.id ?? undefined)
    : { dx: 0, dy: 0 }
  const targetOffset =
    isFreeDrawing && toNode && toHandle
      ? getProspectiveBusbarPortOffset(toNode.id, toHandle.id ?? undefined)
      : { dx: 0, dy: 0 }

  const snap = useMemo(
    () => (isFreeDrawing ? null : findNearestEdgeSnap({ x: toX, y: toY }, zoom, fromX, fromY)),
    [isFreeDrawing, toX, toY, zoom, fromX, fromY],
  )

  useEffect(() => {
    if (isFreeDrawing) {
      clearActiveSnap()
      return
    }
    setActiveSnap(snap)
    return () => {
      clearActiveSnap()
    }
  }, [isFreeDrawing, snap])

  const targetX = snap ? snap.point.x : toX
  const targetY = snap ? snap.point.y : toY
  const targetPosition = snap ? snap.handlePosition : fromPosition

  const path = useMemo(() => {
    if (isFreeDrawing) {
      const points = getBusbarPathPoints({
        sourceX: fromX + sourceOffset.dx,
        sourceY: fromY + sourceOffset.dy,
        sourcePosition: fromPosition,
        targetX: toX + targetOffset.dx,
        targetY: toY + targetOffset.dy,
        straightThreshold,
      })
      return pointsToSvgPath(points)
    }

    const points = getOrthogonalPathPoints({
      sourceX: fromX,
      sourceY: fromY,
      sourcePosition: fromPosition,
      targetX,
      targetY,
      targetPosition,
      offset: 0,
    })
    return pointsToSvgPath(points)
  }, [isFreeDrawing, fromX, fromY, fromPosition, toX, toY, straightThreshold, targetX, targetY, targetPosition, sourceOffset.dx, sourceOffset.dy, targetOffset.dx, targetOffset.dy])

  const labelPoint = useMemo(() => {
    if (!isFreeDrawing) return null
    const points = getBusbarPathPoints({
      sourceX: fromX + sourceOffset.dx,
      sourceY: fromY + sourceOffset.dy,
      sourcePosition: fromPosition,
      targetX: toX + targetOffset.dx,
      targetY: toY + targetOffset.dy,
      straightThreshold,
    })
    return getBusbarPathMidpoint(points)
  }, [isFreeDrawing, fromX, fromY, fromPosition, toX, toY, straightThreshold, sourceOffset.dx, sourceOffset.dy, targetOffset.dx, targetOffset.dy])

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={isFreeDrawing ? BUSBAR_COLOR : '#64748b'}
        strokeWidth={isFreeDrawing ? BUSBAR_STROKE_WIDTH : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={props.connectionLineStyle}
      />
      {isFreeDrawing && labelPoint && (
        <text
          x={labelPoint.x}
          y={labelPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          stroke="#1f2937"
          strokeWidth={2 / zoom}
          paintOrder="stroke"
          fontSize={36 / zoom}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          750V
        </text>
      )}
      {snap && (
        <circle
          cx={snap.point.x}
          cy={snap.point.y}
          r={4 / zoom}
          fill="#3b82f6"
          stroke="#ffffff"
          strokeWidth={1 / zoom}
        />
      )}
    </g>
  )
}
