import { Position } from '@xyflow/react'
import type { OrthogonalPathPoint } from './orthogonal-router.ts'
import { getPathMidpoint } from './orthogonal-router.ts'

const DEFAULT_STRAIGHT_THRESHOLD = 16

function isHorizontal(position: Position): boolean {
  return position === Position.Left || position === Position.Right
}

function isOutward(sourcePosition: Position, dx: number, dy: number): boolean {
  switch (sourcePosition) {
    case Position.Right:
      return dx >= 0
    case Position.Left:
      return dx <= 0
    case Position.Bottom:
      return dy >= 0
    case Position.Top:
      return dy <= 0
    default:
      return true
  }
}

export interface BusbarPathOptions {
  sourceX: number
  sourceY: number
  sourcePosition: Position
  targetX: number
  targetY: number
  straightThreshold?: number
}

export function getBusbarPathPoints(options: BusbarPathOptions): OrthogonalPathPoint[] {
  const {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    straightThreshold = DEFAULT_STRAIGHT_THRESHOLD,
  } = options

  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  const outward = isOutward(sourcePosition, dx, dy)

  const points: OrthogonalPathPoint[] = [{ x: sourceX, y: sourceY }]

  if (isHorizontal(sourcePosition)) {
    // 源端口在左/右：优先沿水平方向走，再转垂直。
    if (outward && absDy <= straightThreshold) {
      // 右侧/左侧水平区域：纯水平线
      points.push({ x: targetX, y: sourceY })
    } else if (!outward && absDx <= straightThreshold) {
      // 反方向的正上/正下区域：纯垂直线
      points.push({ x: sourceX, y: targetY })
    } else if (outward) {
      // 向外的 L：先水平后垂直
      points.push({ x: targetX, y: sourceY })
      points.push({ x: targetX, y: targetY })
    } else {
      // 向内的 L：先垂直后水平，避免穿过源节点
      points.push({ x: sourceX, y: targetY })
      points.push({ x: targetX, y: targetY })
    }
  } else {
    // 源端口在上/下：优先沿垂直方向走，再转水平。
    if (outward && absDx <= straightThreshold) {
      // 正下/正上区域：纯垂直线
      points.push({ x: sourceX, y: targetY })
    } else if (!outward && absDy <= straightThreshold) {
      // 反方向的正左/正右区域：纯水平线
      points.push({ x: targetX, y: sourceY })
    } else if (outward) {
      // 向外的 L：先垂直后水平
      points.push({ x: sourceX, y: targetY })
      points.push({ x: targetX, y: targetY })
    } else {
      // 向内的 L：先水平后垂直
      points.push({ x: targetX, y: sourceY })
      points.push({ x: targetX, y: targetY })
    }
  }

  return points
}

export function pointsToSvgPath(points: OrthogonalPathPoint[]): string {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

export function getBusbarPathMidpoint(points: OrthogonalPathPoint[]): OrthogonalPathPoint {
  return getPathMidpoint(points)
}
