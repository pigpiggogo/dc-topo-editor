import type { ReactElement } from 'react'
import { useCallback } from 'react'
import { useBoundStore } from '@/store'
import { eventBus } from '@/core/event-bus/event-bus'

export interface EdgeToolbarProps {
  edgeId: string
  x?: number
  y?: number
}

export function EdgeToolbar(props: EdgeToolbarProps): ReactElement {
  const { edgeId, x, y } = props
  const removeEdge = useBoundStore((state) => state.removeEdge)
  const setEdges = useBoundStore((state) => state.setEdges)
  const edgeType = useBoundStore((state) => state.getEdgeById(edgeId)?.type)

  const handleDelete = useCallback((): void => {
    removeEdge(edgeId)
    eventBus.emit('canvas.edgeRemoved', { edgeId })
  }, [removeEdge, edgeId])

  const handleToggleStyle = useCallback((): void => {
    setEdges((currentEdges) =>
      currentEdges.map((e) => {
        if (e.id === edgeId) {
          const currentData = e.data as Record<string, unknown> | undefined
          const currentStyle = (currentData?.style as string) ?? 'straight'
          const nextStyle = currentStyle === 'orthogonal' ? 'straight' : 'orthogonal'
          return {
            ...e,
            data: {
              ...currentData,
              style: nextStyle,
            },
          }
        }
        return e
      }),
    )
  }, [setEdges, edgeId])

  return (
    <div
      className="nodrag nopan flex gap-1 rounded bg-scada-panel border border-scada-border shadow-sm px-1 py-0.5"
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -150%)',
        left: x ?? 0,
        top: y ?? 0,
        zIndex: 1001,
      }}
    >
      <button
        className="text-xs px-1.5 py-0.5 hover:bg-red-100 hover:text-red-600 rounded text-scada-text-muted transition-colors"
        onClick={handleDelete}
        title="删除连线"
        type="button"
      >
        删除
      </button>
      {edgeType !== 'busbar' && (
        <button
          className="text-xs px-1.5 py-0.5 hover:bg-blue-100 hover:text-blue-600 rounded text-scada-text-muted transition-colors"
          onClick={handleToggleStyle}
          title="切换连线样式"
          type="button"
        >
          样式
        </button>
      )}
    </div>
  )
}
