import { Position } from '@xyflow/react'

export interface OrthogonalPathPoint {
  x: number
  y: number
}

export interface OrthogonalPathOptions {
  sourceX: number
  sourceY: number
  sourcePosition: Position
  targetX: number
  targetY: number
  targetPosition: Position
  offset?: number
}

function isHorizontal(position: Position): boolean {
  return position === Position.Left || position === Position.Right
}

export function getOrthogonalPathPoints(options: OrthogonalPathOptions): OrthogonalPathPoint[] {
  const { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, offset = 20 } = options

  const points: OrthogonalPathPoint[] = [{ x: sourceX, y: sourceY }]

  // Source exit point: move outward from the handle by the offset
  let exitX = sourceX
  let exitY = sourceY

  if (sourcePosition === Position.Top) {
    exitY -= offset
  } else if (sourcePosition === Position.Bottom) {
    exitY += offset
  } else if (sourcePosition === Position.Left) {
    exitX -= offset
  } else if (sourcePosition === Position.Right) {
    exitX += offset
  }

  points.push({ x: exitX, y: exitY })

  // Target entry point: move inward toward the handle by the offset
  let entryX = targetX
  let entryY = targetY

  if (targetPosition === Position.Top) {
    entryY -= offset
  } else if (targetPosition === Position.Bottom) {
    entryY += offset
  } else if (targetPosition === Position.Left) {
    entryX -= offset
  } else if (targetPosition === Position.Right) {
    entryX += offset
  }

  // Already aligned horizontally or vertically -> straight line
  if (exitX === entryX || exitY === entryY) {
    points.push({ x: entryX, y: entryY })
  } else {
    // Prefer a single 90° turn (L-shape) by extending from the source direction first.
    // If the source handle is horizontal, go horizontally to align with the target,
    // then turn vertically. If vertical, go vertically first, then horizontally.
    if (isHorizontal(sourcePosition)) {
      points.push({ x: entryX, y: exitY })
    } else {
      points.push({ x: exitX, y: entryY })
    }
    points.push({ x: entryX, y: entryY })
  }

  points.push({ x: targetX, y: targetY })

  return points
}

export function pointsToSvgPath(points: OrthogonalPathPoint[]): string {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

export function getPathMidpoint(points: OrthogonalPathPoint[]): OrthogonalPathPoint {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1) return { ...points[0] }

  let totalLength = 0
  const segmentLengths: number[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    segmentLengths.push(length)
    totalLength += length
  }

  if (totalLength === 0) return { ...points[0] }

  const targetLength = totalLength / 2
  let accumulated = 0

  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = segmentLengths[i]
    if (accumulated + segmentLength >= targetLength) {
      const remaining = targetLength - accumulated
      const t = segmentLength === 0 ? 0 : remaining / segmentLength
      const a = points[i]
      const b = points[i + 1]
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      }
    }
    accumulated += segmentLength
  }

  return { ...points[points.length - 1] }
}
