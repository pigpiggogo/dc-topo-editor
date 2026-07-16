import type { StateCreator } from 'zustand'
import type { Node, Edge, Viewport } from '@xyflow/react'
import { eventBus } from '../../core/event-bus/event-bus.ts'
import type { LayerType } from '../../types/index.ts'
import { LAYERS } from '../../constants/index.ts'

export interface CanvasSlice {
  nodes: Node[]
  edges: Edge[]
  viewport: Viewport

  addNode: (node: Node) => void
  removeNode: (nodeId: string) => void
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void
  addEdge: (edge: Edge) => void
  removeEdge: (edgeId: string) => void
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  setViewport: (viewport: Viewport) => void
  selectNode: (nodeId: string | null) => void
  setNodeSelected: (nodeId: string, selected: boolean) => void
  setEdgeSelected: (edgeId: string, selected: boolean) => void

  layerStates: Record<LayerType, { visible: boolean; locked: boolean }>
  toggleLayerVisible: (layerType: LayerType) => void
  toggleLayerLocked: (layerType: LayerType) => void
  setNodeLayer: (nodeId: string, layerType: LayerType) => void

  getNodeById: (nodeId: string) => Node | undefined
  getEdgeById: (edgeId: string) => Edge | undefined
  getEdgesByNodeId: (nodeId: string) => Edge[]
  getSelectedNodes: () => Node[]
}

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  addNode: (node) =>
    set((state) => {
      const layerType: LayerType = (node.data?.layer as LayerType) ?? 'device'
      const layerConfig = LAYERS.find((l) => l.id === layerType)
      const zIndex = layerConfig?.zIndex ?? 10
      const isVisible = state.layerStates[layerType]?.visible ?? true
      const existingData = (node.data ?? {}) as Record<string, unknown>
      const enhancedNode: Node = {
        ...node,
        data: { ...existingData, layer: layerType },
        zIndex,
        hidden: !isVisible,
      }
      eventBus.emit('canvas.nodeAdded', { nodeId: node.id, type: node.type ?? '', position: node.position })
      return { nodes: [...state.nodes, enhancedNode] }
    }),

  removeNode: (nodeId) =>
    set((state) => {
      eventBus.emit('canvas.nodeRemoved', { nodeId })
      return {
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      }
    }),

  updateNodePosition: (nodeId, position) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, position } : n,
      ),
    })),

  addEdge: (edge) =>
    set((state) => {
      eventBus.emit('canvas.edgeAdded', { edgeId: edge.id, source: edge.source, target: edge.target })
      return { edges: [...state.edges, edge] }
    }),

  removeEdge: (edgeId) =>
    set((state) => {
      eventBus.emit('canvas.edgeRemoved', { edgeId })
      return { edges: state.edges.filter((e) => e.id !== edgeId) }
    }),

  setNodes: (updater) =>
    set((state) => ({
      nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
    })),

  setEdges: (updater) =>
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater,
    })),

  setViewport: (viewport) =>
    set(() => {
      eventBus.emit('canvas.viewportChanged', { zoom: viewport.zoom, x: viewport.x, y: viewport.y })
      return { viewport }
    }),

  selectNode: (nodeId) =>
    set((state) => {
      eventBus.emit('canvas.nodeSelected', { nodeId })
      return {
        nodes: state.nodes.map((n) => ({
          ...n,
          selected: n.id === nodeId,
        })),
      }
    }),

  setNodeSelected: (nodeId, selected) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, selected } : n,
      ),
    })),

  setEdgeSelected: (edgeId, selected) =>
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, selected } : e,
      ),
    })),

  layerStates: {
    background: { visible: true, locked: true },
    device: { visible: true, locked: false },
    annotation: { visible: true, locked: false },
  },

  toggleLayerVisible: (layerType) =>
    set((state) => {
      const newVisible = !state.layerStates[layerType].visible
      const nextLayerStates: Record<LayerType, { visible: boolean; locked: boolean }> = {
        ...state.layerStates,
        [layerType]: { ...state.layerStates[layerType], visible: newVisible },
      }
      const nextNodes = state.nodes.map((n) => {
        const nodeLayer = (n.data?.layer as LayerType) ?? 'device'
        if (nodeLayer === layerType) {
          return { ...n, hidden: !newVisible }
        }
        return n
      })
      return { layerStates: nextLayerStates, nodes: nextNodes }
    }),

  toggleLayerLocked: (layerType) =>
    set((state) => {
      const newLocked = !state.layerStates[layerType].locked
      const nextLayerStates: Record<LayerType, { visible: boolean; locked: boolean }> = {
        ...state.layerStates,
        [layerType]: { ...state.layerStates[layerType], locked: newLocked },
      }
      const nextNodes = state.nodes.map((n) => {
        const nodeLayer = (n.data?.layer as LayerType) ?? 'device'
        if (nodeLayer === layerType) {
          return { ...n, draggable: !newLocked, selectable: !newLocked }
        }
        return n
      })
      return { layerStates: nextLayerStates, nodes: nextNodes }
    }),

  setNodeLayer: (nodeId, layerType) =>
    set((state) => {
      const layerConfig = LAYERS.find((l) => l.id === layerType)
      const zIndex = layerConfig?.zIndex ?? 10
      const isVisible = state.layerStates[layerType]?.visible ?? true
      return {
        nodes: state.nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: { ...((n.data ?? {}) as Record<string, unknown>), layer: layerType },
                zIndex,
                hidden: !isVisible,
              }
            : n,
        ),
      }
    }),

  getNodeById: (nodeId) => get().nodes.find((n) => n.id === nodeId),

  getEdgeById: (edgeId) => get().edges.find((e) => e.id === edgeId),

  getEdgesByNodeId: (nodeId) =>
    get().edges.filter((e) => e.source === nodeId || e.target === nodeId),

  getSelectedNodes: () => get().nodes.filter((n) => n.selected === true),
})
