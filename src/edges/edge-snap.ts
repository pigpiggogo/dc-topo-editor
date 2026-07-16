import { Position } from '@xyflow/react'
import { getAllEdgePaths, getEdgePath } from './edge-path-registry.ts'
import type { OrthogonalPathPoint } from './orthogonal-router.ts'

export interface EdgeSnapInfo {
  edgeId: string
  point: OrthogonalPathPoint
  orientation: 'horizontal' | 'vertical'
  handlePosition: Position
}

const SNAP_SCREEN_PX = 24

let activeSnap: EdgeSnapInfo | null = null

export function setActiveSnap(snap: EdgeSnapInfo | null): void {
  activeSnap = snap
}

export function getActiveSnap(): EdgeSnapInfo | null {
  return activeSnap
}

export function clearActiveSnap(): void {
  activeSnap = null
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getFootPoint(
  a: OrthogonalPathPoint,
  b: OrthogonalPathPoint,
  mouse: OrthogonalPathPoint,
): OrthogonalPathPoint {
  if (a.x === b.x) {
    return { x: a.x, y: clamp(mouse.y, Math.min(a.y, b.y), Math.max(a.y, b.y)) }
  }
  return { x: clamp(mouse.x, Math.min(a.x, b.x), Math.max(a.x, b.x)), y: a.y }
}

function chooseBranchHandlePosition(
  orientation: 'horizontal' | 'vertical',
  sourceX: number,
  sourceY: number,
  snapPoint: OrthogonalPathPoint,
): Position {
  if (orientation === 'horizontal') {
    return sourceY <= snapPoint.y ? Position.Top : Position.Bottom
  }
  return sourceX <= snapPoint.x ? Position.Left : Position.Right
}

export function findNearestEdgeSnap(
  mouse: OrthogonalPathPoint,
  zoom: number,
  sourceX: number,
  sourceY: number,
): EdgeSnapInfo | null {
  const threshold = SNAP_SCREEN_PX / zoom
  let best: EdgeSnapInfo | null = null
  let bestDistance = threshold

  for (const [edgeId, points] of getAllEdgePaths()) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]
      const foot = getFootPoint(a, b, mouse)
      const distance = Math.hypot(foot.x - mouse.x, foot.y - mouse.y)

      if (distance < bestDistance) {
        const orientation = a.x === b.x ? 'vertical' : 'horizontal'
        bestDistance = distance
        best = {
          edgeId,
          point: foot,
          orientation,
          handlePosition: chooseBranchHandlePosition(orientation, sourceX, sourceY, foot),
        }
      }
    }
  }

  return best
}

export function getEdgePathPoints(edgeId: string): OrthogonalPathPoint[] | undefined {
  return getEdgePath(edgeId)
}
