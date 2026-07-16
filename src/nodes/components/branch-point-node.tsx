import type { NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import type { ReactElement } from 'react'
import { useBoundStore } from '@/store'
import { getBusbarPathPoints } from '@/edges/busbar-router'
import { getSourceHandlePoint, handleIdToPosition } from '@/edges/port-utils'

const NODE_SIZE = 1
const DRAG_SIZE = 20
const MIN_BUSBAR_LENGTH = 40

function getEndpointCursor(nodeId: string): string {
  const state = useBoundStore.getState()
  const edge = state.edges.find((e) => e.target === nodeId && e.type === 'busbar')
  if (!edge) return 'move'

  const sourceNode = state.getNodeById(edge.source)
  if (!sourceNode) return 'move'

  const sourcePoint = getSourceHandlePoint(sourceNode, edge.sourceHandle ?? undefined)
  const branchNode = state.getNodeById(nodeId)
  const targetX = branchNode?.position.x ?? sourcePoint.x
  const targetY = branchNode?.position.y ?? sourcePoint.y

  const points = getBusbarPathPoints({
    sourceX: sourcePoint.x,
    sourceY: sourcePoint.y,
    sourcePosition: handleIdToPosition(edge.sourceHandle ?? undefined),
    targetX,
    targetY,
  })

  if (points.length < 2) return 'move'
  const last = points[points.length - 1]
  const prev = points[points.length - 2]
  return Math.abs(last.y - prev.y) < 1e-6 ? 'ew-resize' : 'ns-resize'
}

export function BranchPointNode(props: NodeProps): ReactElement {
  const { orientation = 'horizontal' } = (props.data as { orientation?: 'horizontal' | 'vertical' } | undefined) ?? {}
  const isHorizontal = orientation === 'horizontal'
  const cursor = getEndpointCursor(props.id)

  const handles = [
    { id: 'inline-start', position: isHorizontal ? Position.Left : Position.Top },
    { id: 'inline-end', position: isHorizontal ? Position.Right : Position.Bottom },
    { id: 'branch-a', position: isHorizontal ? Position.Top : Position.Left },
    { id: 'branch-b', position: isHorizontal ? Position.Bottom : Position.Right },
  ]

  return (
    <div
      style={{
        width: NODE_SIZE,
        height: NODE_SIZE,
        position: 'relative',
      }}
      title="拖拽以延长/缩短母线"
    >
      <div
        style={{
          position: 'absolute',
          left: -(DRAG_SIZE - NODE_SIZE) / 2,
          top: -(DRAG_SIZE - NODE_SIZE) / 2,
          width: DRAG_SIZE,
          height: DRAG_SIZE,
          cursor,
        }}
      />
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={handle.position}
          isConnectableStart
          isConnectableEnd
          style={{
            width: NODE_SIZE,
            height: NODE_SIZE,
            backgroundColor: 'transparent',
            border: 'none',
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

export { MIN_BUSBAR_LENGTH }
