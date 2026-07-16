import type { Node, Edge, Viewport } from '@xyflow/react'
import { APP_VERSION } from '@/constants'

export interface SerializedDeviceData {
  nodeId: string
  data: Record<string, unknown>
}

export interface SerializedTopology {
  version: string
  createdAt: string
  appVersion: string
  nodes: Node[]
  edges: Edge[]
  deviceData: SerializedDeviceData[]
  viewport: Viewport
  layerStates: Record<string, { visible: boolean; locked: boolean }>
  theme: string
}

export interface DeserializationResult {
  success: boolean
  data?: SerializedTopology
  error?: string
}

export interface TopologyState {
  nodes: Node[]
  edges: Edge[]
  deviceData: Map<string, Record<string, unknown>>
  viewport: Viewport
  layerStates: Record<string, { visible: boolean; locked: boolean }>
  theme: string
}

export function serializeTopology(state: TopologyState): string {
  const serialized: SerializedTopology = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    nodes: state.nodes,
    edges: state.edges,
    deviceData: Array.from(state.deviceData.entries()).map(([nodeId, data]) => ({
      nodeId,
      data,
    })),
    viewport: state.viewport,
    layerStates: state.layerStates,
    theme: state.theme,
  }
  return JSON.stringify(serialized, null, 2)
}

export function deserializeTopology(jsonString: string): DeserializationResult {
  try {
    const parsed: unknown = JSON.parse(jsonString)

    if (!isValidTopology(parsed)) {
      return { success: false, error: 'Invalid topology file format' }
    }

    return { success: true, data: parsed as SerializedTopology }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error'
    return { success: false, error: message }
  }
}

function isValidTopology(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>

  if (typeof obj.version !== 'string') return false
  if (!Array.isArray(obj.nodes)) return false
  if (!Array.isArray(obj.edges)) return false
  if (!Array.isArray(obj.deviceData)) return false
  if (typeof obj.viewport !== 'object' || obj.viewport === null) return false
  if (typeof obj.theme !== 'string') return false

  return true
}

export function convertToStoreState(serialized: SerializedTopology): TopologyState {
  const deviceData = new Map<string, Record<string, unknown>>()
  for (const item of serialized.deviceData) {
    deviceData.set(item.nodeId, item.data)
  }

  return {
    nodes: serialized.nodes,
    edges: serialized.edges,
    deviceData,
    viewport: serialized.viewport,
    layerStates: serialized.layerStates,
    theme: serialized.theme,
  }
}
