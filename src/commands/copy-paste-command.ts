import type { Edge, Node } from '@xyflow/react'
import { Command } from '../core/command/command.ts'
import { useBoundStore } from '../store/index.ts'

export interface CopyPasteOffset {
  x: number
  y: number
}

export interface CopyPayload {
  nodes: Node[]
  edges: Edge[]
  deviceData: Map<string, Record<string, unknown>>
}

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

export class CopyPasteCommand extends Command {
  private readonly payload: CopyPayload
  private readonly offset: CopyPasteOffset
  private createdNodeIds: string[] = []
  private createdEdgeIds: string[] = []
  private previousSelectedNodeIds: string[] = []
  private previousSelectedEdgeIds: string[] = []

  constructor(payload: CopyPayload, offset: CopyPasteOffset) {
    super()
    this.payload = {
      nodes: clone(payload.nodes),
      edges: clone(payload.edges),
      deviceData: clone(payload.deviceData),
    }
    this.offset = { ...offset }
  }

  execute(): void {
    const store = useBoundStore.getState()

    this.previousSelectedNodeIds = store.nodes.filter((n) => n.selected).map((n) => n.id)
    this.previousSelectedEdgeIds = store.edges.filter((e) => e.selected).map((e) => e.id)

    const oldToNewNodeId = new Map<string, string>()
    this.createdNodeIds = []
    this.createdEdgeIds = []

    for (const node of this.payload.nodes) {
      const newNodeId = generateId('node')
      oldToNewNodeId.set(node.id, newNodeId)
      this.createdNodeIds.push(newNodeId)

      const { id: _oldId, selected: _selected, dragging: _dragging, measured: _measured, ...rest } = node
      const newNode: Node = {
        ...rest,
        id: newNodeId,
        position: {
          x: node.position.x + this.offset.x,
          y: node.position.y + this.offset.y,
        },
        selected: false,
      }
      store.addNode(newNode)

      const deviceData = this.payload.deviceData.get(node.id)
      if (deviceData !== undefined) {
        store.setDeviceData(newNodeId, clone(deviceData))
      }
    }

    for (const edge of this.payload.edges) {
      const newSourceId = oldToNewNodeId.get(edge.source)
      const newTargetId = oldToNewNodeId.get(edge.target)
      if (newSourceId === undefined || newTargetId === undefined) {
        continue
      }

      const newEdgeId = generateId('edge')
      this.createdEdgeIds.push(newEdgeId)

      const { id: _oldId, selected: _selected, ...rest } = edge
      const newEdge: Edge = {
        ...rest,
        id: newEdgeId,
        source: newSourceId,
        target: newTargetId,
        selected: false,
      }
      store.addEdge(newEdge)
    }

    store.setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: this.createdNodeIds.includes(n.id),
      })),
    )
    store.setEdges((edges) =>
      edges.map((e) => ({
        ...e,
        selected: this.createdEdgeIds.includes(e.id),
      })),
    )
  }

  undo(): void {
    const store = useBoundStore.getState()

    for (const edgeId of this.createdEdgeIds) {
      store.removeEdge(edgeId)
    }

    for (const nodeId of this.createdNodeIds) {
      store.removeNode(nodeId)
      store.removeDeviceData(nodeId)
    }

    store.setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: this.previousSelectedNodeIds.includes(n.id),
      })),
    )
    store.setEdges((edges) =>
      edges.map((e) => ({
        ...e,
        selected: this.previousSelectedEdgeIds.includes(e.id),
      })),
    )
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    return '复制粘贴选中元素'
  }
}
