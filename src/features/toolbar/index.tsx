import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'
import { useBoundStore } from '@/store'
import { globalCommandBus } from '@/engine/command-bus-instance'
import { DeleteNodesCommand, ClearCanvasCommand } from '@/commands'
import { ToolbarButton } from './toolbar-button'
import { ExportDialog } from '@/features/export'
import {
  saveTopology,
  loadTopology,
  createFileInput,
} from '@/features/export'

export function Toolbar(): ReactElement {
  const nodes = useBoundStore((state) => state.nodes)
  const edges = useBoundStore((state) => state.edges)
  const viewport = useBoundStore((state) => state.viewport)
  const deviceData = useBoundStore((state) => state.deviceData)
  const layerStates = useBoundStore((state) => state.layerStates)
  const theme = useBoundStore((state) => state.theme)
  const undo = useBoundStore((state) => state.undo)
  const canUndo = useBoundStore((state) => state.canUndo)
  const setNodes = useBoundStore((state) => state.setNodes)
  const setEdges = useBoundStore((state) => state.setEdges)
  const setViewport = useBoundStore((state) => state.setViewport)
  const setDeviceData = useBoundStore((state) => state.setDeviceData)

  const [exportOpen, setExportOpen] = useState(false)

  const selectedNodes = nodes.filter((n) => n.selected)
  const selectedEdges = edges.filter((e) => e.selected)
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0

  const zoomPercent = Math.round((viewport.zoom ?? 1) * 100)

  const handleUndo = useCallback(() => {
    if (canUndo && undo) undo()
  }, [canUndo, undo])

  const handleClear = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return
    globalCommandBus.execute(new ClearCanvasCommand())
  }, [nodes, edges])

  const handleDelete = useCallback(() => {
    const nodeIds = selectedNodes.map((n) => n.id)
    const edgeIds = selectedEdges.map((e) => e.id)
    if (nodeIds.length === 0 && edgeIds.length === 0) return
    globalCommandBus.execute(new DeleteNodesCommand(nodeIds, edgeIds))
  }, [selectedNodes, selectedEdges])

  const handleExport = useCallback(() => {
    setExportOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    const state = {
      nodes,
      edges,
      deviceData,
      viewport,
      layerStates,
      theme,
    }
    saveTopology(state)
  }, [nodes, edges, deviceData, viewport, layerStates, theme])

  const handleLoad = useCallback(() => {
    createFileInput(async (file) => {
      try {
        const state = await loadTopology(file)
        setNodes(state.nodes)
        setEdges(state.edges)
        for (const [nodeId, data] of state.deviceData.entries()) {
          setDeviceData(nodeId, data)
        }
        setViewport(state.viewport)
      } catch (error) {
        const message = error instanceof Error ? error.message : '加载失败'
        // eslint-disable-next-line no-console
        console.error('Load failed:', message)
      }
    })
  }, [setNodes, setEdges, setDeviceData, setViewport])

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <ToolbarButton
          label="撤销"
          onClick={handleUndo}
          disabled={!canUndo}
        />
        <ToolbarButton
          label="清空画布"
          onClick={handleClear}
          disabled={nodes.length === 0 && edges.length === 0}
        />
        <div className="w-px h-4 bg-scada-border mx-1" />
        <ToolbarButton
          label="删除"
          onClick={handleDelete}
          disabled={!hasSelection}
        />
        <div className="w-px h-4 bg-scada-border mx-1" />
        <span className="text-xs text-scada-text-muted min-w-[40px] text-center">
          {zoomPercent}%
        </span>
        <div className="w-px h-4 bg-scada-border mx-1" />
        <ToolbarButton
          label="保存"
          onClick={handleSave}
        />
        <ToolbarButton
          label="加载"
          onClick={handleLoad}
        />
        <div className="w-px h-4 bg-scada-border mx-1" />
        <ToolbarButton
          label="导出"
          onClick={handleExport}
        />
      </div>
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </>
  )
}
