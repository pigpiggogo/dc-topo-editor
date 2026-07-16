import type { Node, XYPosition } from '@xyflow/react'
import { Position } from '@xyflow/react'

const DEFAULT_NODE_WIDTH = 80
const DEFAULT_NODE_HEIGHT = 96

export function getNodeDimensions(node: Node): { width: number; height: number } {
  const width = node.width ?? node.measured?.width ?? DEFAULT_NODE_WIDTH
  const height = node.height ?? node.measured?.height ?? DEFAULT_NODE_HEIGHT
  return { width, height }
}

export function handleIdToPosition(handleId: string | undefined): Position {
  if (handleId?.includes('right')) return Position.Right
  if (handleId?.includes('left')) return Position.Left
  if (handleId?.includes('top')) return Position.Top
  if (handleId?.includes('bottom')) return Position.Bottom
  return Position.Right
}

export function getSourceHandlePoint(node: Node, handleId: string | undefined): XYPosition {
  const { width, height } = getNodeDimensions(node)
  const position = handleIdToPosition(handleId)
  switch (position) {
    case Position.Right:
      return { x: node.position.x + width, y: node.position.y + height / 2 }
    case Position.Left:
      return { x: node.position.x, y: node.position.y + height / 2 }
    case Position.Top:
      return { x: node.position.x + width / 2, y: node.position.y }
    case Position.Bottom:
      return { x: node.position.x + width / 2, y: node.position.y + height }
    default:
      return { x: node.position.x + width, y: node.position.y + height / 2 }
  }
}
