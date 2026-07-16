import type { Node, Edge } from '@xyflow/react'
import { pluginManager } from '@/engine/plugin-instance'
import { useBoundStore } from '@/store'
import type { TemplateDefinition } from './template-types'

function generateNodeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'node-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

export interface LoadedTemplateData {
  nodes: Node[]
  edges: Edge[]
  deviceDataMap: Map<string, Record<string, unknown>>
}

export function buildTemplateData(template: TemplateDefinition): LoadedTemplateData {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const deviceDataMap = new Map<string, Record<string, unknown>>()

  for (const tNode of template.nodes) {
    const plugin = pluginManager.getPlugin(tNode.type)
    if (!plugin) continue

    const defaultData = plugin.defaultData()
    const ports = plugin.getPorts()
    const mergedData: Record<string, unknown> = { ...defaultData, ...tNode.data, ports }

    const node: Node = {
      id: tNode.id,
      type: tNode.type,
      position: tNode.position,
      data: mergedData,
    }

    nodes.push(node)
    deviceDataMap.set(tNode.id, mergedData)
  }

  for (const tEdge of template.edges) {
    const edge: Edge = {
      id: tEdge.id,
      source: tEdge.source,
      target: tEdge.target,
      sourceHandle: tEdge.sourceHandle,
      targetHandle: tEdge.targetHandle,
      type: tEdge.type ?? 'orthogonal',
      data: {
        voltage: 750,
        style: 'orthogonal',
        ...tEdge.data,
      },
    }
    edges.push(edge)
  }

  return { nodes, edges, deviceDataMap }
}

export function applyTemplate(
  template: TemplateDefinition,
  options?: { clearExisting?: boolean; offset?: { x: number; y: number } },
): void {
  const { clearExisting = true, offset = { x: 0, y: 0 } } = options ?? {}

  const idMap = new Map<string, string>()
  const nodes: Node[] = []
  const deviceDataMap = new Map<string, Record<string, unknown>>()

  for (const tNode of template.nodes) {
    const plugin = pluginManager.getPlugin(tNode.type)
    if (!plugin) continue

    const newId = generateNodeId()
    idMap.set(tNode.id, newId)

    const defaultData = plugin.defaultData()
    const ports = plugin.getPorts()
    const mergedData: Record<string, unknown> = { ...defaultData, ...tNode.data, ports }

    const node: Node = {
      id: newId,
      type: tNode.type,
      position: {
        x: tNode.position.x + offset.x,
        y: tNode.position.y + offset.y,
      },
      data: mergedData,
    }

    nodes.push(node)
    deviceDataMap.set(newId, mergedData)
  }

  const edges: Edge[] = []
  for (const tEdge of template.edges) {
    const newSource = idMap.get(tEdge.source)
    const newTarget = idMap.get(tEdge.target)
    if (!newSource || !newTarget) continue

    const edge: Edge = {
      id: `e-${newSource}-${newTarget}-${Date.now()}`,
      source: newSource,
      target: newTarget,
      sourceHandle: tEdge.sourceHandle,
      targetHandle: tEdge.targetHandle,
      type: tEdge.type ?? 'orthogonal',
      data: {
        voltage: 750,
        style: 'orthogonal',
        ...tEdge.data,
      },
    }
    edges.push(edge)
  }

  const store = useBoundStore.getState()
  if (clearExisting) {
    store.setNodes([])
    store.setEdges([])
  }

  for (const node of nodes) {
    store.addNode(node)
  }
  for (const edge of edges) {
    store.addEdge(edge)
  }

  for (const [nodeId, data] of deviceDataMap.entries()) {
    store.setDeviceData(nodeId, data)
  }
}
