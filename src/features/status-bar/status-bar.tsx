import type { ReactElement } from 'react'
import { useBoundStore } from '@/store'

export function StatusBar(): ReactElement {
  const nodes = useBoundStore((state) => state.nodes)
  const edges = useBoundStore((state) => state.edges)
  const viewport = useBoundStore((state) => state.viewport)

  const zoomPercent = Math.round((viewport.zoom ?? 1) * 100)
  const selectedNode = nodes.find((n) => n.selected)

  return (
    <footer className="h-7 flex-shrink-0 border-t border-scada-border bg-scada-panel flex items-center px-3 text-xs text-scada-text-muted gap-3">
      <span>节点: {nodes.length}</span>
      <span className="text-scada-border">|</span>
      <span>连线: {edges.length}</span>
      <span className="text-scada-border">|</span>
      <span>缩放: {zoomPercent}%</span>
      <span className="text-scada-border">|</span>
      <span>
        选中:
        {selectedNode
          ? (selectedNode.data?.name as string) ?? selectedNode.id
          : '无'}
      </span>
    </footer>
  )
}
