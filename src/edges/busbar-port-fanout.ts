import { Position } from '@xyflow/react'
import { useBoundStore } from '../store/index.ts'
import { handleIdToPosition } from './port-utils.ts'

export const BUSBAR_SOURCE_TYPES = new Set(['sst', 'acdc_converter', 'grid'])

export interface PortOffset {
  dx: number
  dy: number
}

function offsetForPosition(position: Position, offset: number): PortOffset {
  switch (position) {
    case Position.Right:
      return { dx: offset, dy: 0 }
    case Position.Left:
      return { dx: -offset, dy: 0 }
    case Position.Top:
      return { dx: 0, dy: -offset }
    case Position.Bottom:
      return { dx: 0, dy: offset }
    default:
      return { dx: offset, dy: 0 }
  }
}

/**
 * 获取某条已存在母线连接在指定端口的偏移量。
 * 同一端口的母线按 id 排序后依次偏移 N * 8px，避免端点圆圈重叠。
 */
export function getBusbarPortOffset(
  nodeId: string,
  handleId: string | undefined,
  edgeId: string,
): PortOffset {
  const edges = useBoundStore.getState().edges
  const portEdges = edges.filter(
    (e) =>
      e.type === 'busbar' &&
      ((e.source === nodeId && e.sourceHandle === handleId) ||
        (e.target === nodeId && e.targetHandle === handleId)),
  )
  portEdges.sort((a, b) => a.id.localeCompare(b.id))
  const index = portEdges.findIndex((e) => e.id === edgeId)
  if (index < 0) return { dx: 0, dy: 0 }
  return offsetForPosition(handleIdToPosition(handleId), index * 16)
}

/**
 * 获取将要新建的母线在某端口的预测偏移量（当前该端口已有 N 条母线 => 偏移 N * 8px）。
 */
export function getProspectiveBusbarPortOffset(
  nodeId: string,
  handleId: string | undefined,
  excludeEdgeId?: string,
): PortOffset {
  const edges = useBoundStore.getState().edges
  const count = edges.filter(
    (e) =>
      e.type === 'busbar' &&
      e.id !== excludeEdgeId &&
      ((e.source === nodeId && e.sourceHandle === handleId) ||
        (e.target === nodeId && e.targetHandle === handleId)),
  ).length
  return offsetForPosition(handleIdToPosition(handleId), count * 16)
}
