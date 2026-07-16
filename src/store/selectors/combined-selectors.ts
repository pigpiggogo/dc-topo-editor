import type { UISlice } from '../slices/ui-store.ts'
import type { CanvasSlice } from '../slices/canvas-store.ts'
import type { DeviceSlice } from '../slices/device-store.ts'
import type { CommandSlice } from '../slices/command-store.ts'
import type { PluginSlice } from '../slices/plugin-store.ts'

export type AllSlices = UISlice & CanvasSlice & DeviceSlice & CommandSlice & PluginSlice

export function getSelectedNodeWithData(store: AllSlices): { node: import('@xyflow/react').Node | undefined; data: Record<string, unknown> | undefined } {
  const selected = store.getSelectedNodes()
  const node = selected.length > 0 ? selected[0] : undefined
  if (node === undefined) return { node: undefined, data: undefined }
  const data = store.getDeviceData(node.id)
  return { node, data }
}

export function getNodesByCategory(store: AllSlices): Map<string, import('@xyflow/react').Node[]> {
  const map = new Map<string, import('@xyflow/react').Node[]>()
  for (const node of store.nodes) {
    const category = (node.data?.category as string) ?? 'unknown'
    const existing = map.get(category) ?? []
    existing.push(node)
    map.set(category, existing)
  }
  return map
}

export interface TopologySummary {
  nodeCount: number
  edgeCount: number
  deviceCount: number
  categoryCounts: Record<string, number>
}

export function getTopologySummary(store: AllSlices): TopologySummary {
  const categoryCounts: Record<string, number> = {}
  for (const node of store.nodes) {
    const category = (node.data?.category as string) ?? 'unknown'
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1
  }

  return {
    nodeCount: store.nodes.length,
    edgeCount: store.edges.length,
    deviceCount: store.deviceData.size,
    categoryCounts,
  }
}
