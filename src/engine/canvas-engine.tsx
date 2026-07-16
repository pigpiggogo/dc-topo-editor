import type { Node, Edge, Viewport, OnConnect, OnConnectStart, OnConnectEnd, OnNodesChange, OnEdgesChange, OnReconnect, Connection, XYPosition } from '@xyflow/react'
import { ReactFlow, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, ConnectionMode, ConnectionLineType, useReactFlow, reconnectEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useBoundStore } from '@/store'
import { globalCommandBus } from '@/engine/command-bus-instance'
import { AddNodeCommand, AddEdgeCommand, BranchOnEdgeCommand, DeleteNodesCommand } from '@/commands'
import { CANVAS_CONFIG } from '@/constants'
import { NodeRenderer } from './node-renderer'
import { AlignmentGuides, type AlignmentGuide } from './alignment-guides'
import { SelectionBox } from './selection-box'
import { OrthogonalEdge, StraightEdge, BusbarEdge, SnappedConnectionLine } from '@/edges'
import { getActiveSnap, clearActiveSnap } from '@/edges/edge-snap'
import { getBusbarPathPoints } from '@/edges/busbar-router'
import { BUSBAR_SOURCE_TYPES, getBusbarPortOffset, getProspectiveBusbarPortOffset } from '@/edges/busbar-port-fanout'
import { getNodeDimensions, getSourceHandlePoint, handleIdToPosition } from '@/edges/port-utils'
import {
  PVPanelNode,
  BatteryNode,
  SSCBNode,
  DCDCNode,
  DCBusNode,
  LoadNode,
  RectifierNode,
  InverterNode,
  ChargerNode,
  MeterNode,
  GridNode,
  SSTNode,
  ACDCConverterNode,
  BranchPointNode,
} from '@/nodes/components'

const nodeTypes = {
  default: NodeRenderer,
  pv_panel: PVPanelNode,
  battery: BatteryNode,
  sscb: SSCBNode,
  dcdc_converter: DCDCNode,
  dc_bus: DCBusNode,
  load: LoadNode,
  rectifier: RectifierNode,
  inverter: InverterNode,
  charger: ChargerNode,
  meter: MeterNode,
  grid: GridNode,
  sst: SSTNode,
  acdc_converter: ACDCConverterNode,
  branch_point: BranchPointNode,
}

const edgeTypes = {
  default: OrthogonalEdge,
  orthogonal: OrthogonalEdge,
  straight: StraightEdge,
  busbar: BusbarEdge,
}



const SNAP_GRID: [number, number] = [CANVAS_CONFIG.gridSize, CANVAS_CONFIG.gridSize]
const ALIGNMENT_SNAP_THRESHOLD = 12
const PRO_OPTIONS = { hideAttribution: true }
const MINIMAP_STYLE = { width: 160, height: 100 }

function constrainBranchPointPosition(nodeId: string, proposed: XYPosition): XYPosition {
  const state = useBoundStore.getState()
  const branchNode = state.getNodeById(nodeId)
  if (!branchNode) return proposed

  const incomingBusbarEdges = state.edges.filter((e) => e.target === nodeId && e.type === 'busbar')
  if (incomingBusbarEdges.length !== 1) return proposed

  const edge = incomingBusbarEdges[0]
  const sourceNode = state.getNodeById(edge.source)
  if (!sourceNode) return proposed

  const sourcePoint = getSourceHandlePoint(sourceNode, edge.sourceHandle ?? undefined)
  const sourceOffset = getBusbarPortOffset(edge.source, edge.sourceHandle ?? undefined, edge.id)
  const currentPoints = getBusbarPathPoints({
    sourceX: sourcePoint.x + sourceOffset.dx,
    sourceY: sourcePoint.y + sourceOffset.dy,
    sourcePosition: handleIdToPosition(edge.sourceHandle ?? undefined),
    targetX: branchNode.position.x,
    targetY: branchNode.position.y,
  })

  if (currentPoints.length < 2) return proposed
  const last = currentPoints[currentPoints.length - 1]
  const prev = currentPoints[currentPoints.length - 2]
  const isHorizontal = Math.abs(last.y - prev.y) < 1e-6

  const MIN_LENGTH = 40

  if (isHorizontal) {
    const minX = last.x >= prev.x ? prev.x + MIN_LENGTH : prev.x - MIN_LENGTH
    const x = last.x >= prev.x ? Math.max(proposed.x, minX) : Math.min(proposed.x, minX)
    return { x, y: prev.y }
  }

  const minY = last.y >= prev.y ? prev.y + MIN_LENGTH : prev.y - MIN_LENGTH
  const y = last.y >= prev.y ? Math.max(proposed.y, minY) : Math.min(proposed.y, minY)
  return { x: prev.x, y }
}

interface SnapResult {
  x: number
  y: number
  guides: AlignmentGuide[]
}

function computeSnapAndGuides(
  nodeId: string,
  position: { x: number; y: number },
  movingIds: string[],
): SnapResult {
  const nodes = useBoundStore.getState().nodes
  const movingNode = nodes.find((n) => n.id === nodeId)
  if (!movingNode) {
    return { x: position.x, y: position.y, guides: [] }
  }

  const { width: mw, height: mh } = getNodeDimensions(movingNode)
  const movingBounds = {
    left: position.x,
    centerX: position.x + mw / 2,
    right: position.x + mw,
    top: position.y,
    centerY: position.y + mh / 2,
    bottom: position.y + mh,
  }

  let snapX: number | undefined
  let snapY: number | undefined
  let minDeltaX = ALIGNMENT_SNAP_THRESHOLD
  let minDeltaY = ALIGNMENT_SNAP_THRESHOLD
  const guides: AlignmentGuide[] = []

  for (const other of nodes) {
    if (other.id === nodeId || movingIds.includes(other.id)) continue
    const { width: ow, height: oh } = getNodeDimensions(other)
    const otherBounds = {
      left: other.position.x,
      centerX: other.position.x + ow / 2,
      right: other.position.x + ow,
      top: other.position.y,
      centerY: other.position.y + oh / 2,
      bottom: other.position.y + oh,
    }

    // Vertical alignment guides (affect x coordinate)
    for (const target of [
      { value: movingBounds.left, snapOffset: 0 },
      { value: movingBounds.centerX, snapOffset: -mw / 2 },
      { value: movingBounds.right, snapOffset: -mw },
    ] as const) {
      for (const refKey of ['left', 'centerX', 'right'] as const) {
        const delta = Math.abs(target.value - otherBounds[refKey])
        if (delta < ALIGNMENT_SNAP_THRESHOLD) {
          guides.push({ orientation: 'vertical', position: otherBounds[refKey] })
          if (delta < minDeltaX) {
            minDeltaX = delta
            snapX = otherBounds[refKey] + target.snapOffset
          }
        }
      }
    }

    // Horizontal alignment guides (affect y coordinate)
    for (const target of [
      { value: movingBounds.top, snapOffset: 0 },
      { value: movingBounds.centerY, snapOffset: -mh / 2 },
      { value: movingBounds.bottom, snapOffset: -mh },
    ] as const) {
      for (const refKey of ['top', 'centerY', 'bottom'] as const) {
        const delta = Math.abs(target.value - otherBounds[refKey])
        if (delta < ALIGNMENT_SNAP_THRESHOLD) {
          guides.push({ orientation: 'horizontal', position: otherBounds[refKey] })
          if (delta < minDeltaY) {
            minDeltaY = delta
            snapY = otherBounds[refKey] + target.snapOffset
          }
        }
      }
    }
  }

  return {
    x: snapX ?? position.x,
    y: snapY ?? position.y,
    guides,
  }
}

export interface CanvasEngineProps {
  onInit?: () => void
}

export function CanvasEngine({ onInit }: CanvasEngineProps): ReactElement {
  // Use local state for React Flow to avoid Zustand ↔ React Flow sync loops
  const [localNodes, setLocalNodes] = useState<Node[]>([])
  const [localEdges, setLocalEdges] = useState<Edge[]>([])
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])

  const setViewport = useBoundStore((state) => state.setViewport)
  const setNodeSelected = useBoundStore((state) => state.setNodeSelected)
  const setEdgeSelected = useBoundStore((state) => state.setEdgeSelected)
  const updateNodePosition = useBoundStore((state) => state.updateNodePosition)
  const setStoreNodes = useBoundStore((state) => state.setNodes)
  const setStoreEdges = useBoundStore((state) => state.setEdges)

  // Sync Zustand store nodes → local nodes (one-way: store is source of truth for additions)
  const storeNodes = useBoundStore((state) => state.nodes)
  const storeEdges = useBoundStore((state) => state.edges)

  const { screenToFlowPosition } = useReactFlow()
  const flowWrapperRef = useRef<HTMLDivElement>(null)
  const selectionBoxRef = useRef<{
    start: { x: number; y: number }
    end: { x: number; y: number }
  } | null>(null)

  const [selectionBox, setSelectionBox] = useState<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    wrapperRect: { left: number; top: number }
  } | null>(null)


  useEffect(() => {
    if (onInit) onInit()
  }, [onInit])

  // When store nodes change (e.g. from PaletteItem click), sync to local state
  useEffect(() => {
    setLocalNodes(storeNodes)
  }, [storeNodes])

  useEffect(() => {
    setLocalEdges(storeEdges)
  }, [storeEdges])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const positionChanges = changes.filter(
        (c): c is Extract<typeof c, { type: 'position' }> => c.type === 'position',
      )
      const movingIds = positionChanges.map((c) => c.id)
      const isDragging = positionChanges.some((c) => c.dragging === true)
      const isDragEnd = positionChanges.some((c) => c.dragging === false)

      // Filter out dimensions changes to avoid ResizeObserver infinite loops
      const guides: AlignmentGuide[] = []
      const syncChanges = changes.filter((c) => c.type !== 'dimensions').map((change) => {
        if (change.type === 'position' && change.position !== undefined) {
          const movingNode = useBoundStore.getState().getNodeById(change.id)
          if (movingNode?.type === 'branch_point') {
            const constrained = constrainBranchPointPosition(change.id, change.position)
            return { ...change, position: constrained }
          }
          const result = computeSnapAndGuides(change.id, change.position, movingIds)
          guides.push(...result.guides)
          return { ...change, position: { x: result.x, y: result.y } }
        }
        return change
      })

      if (isDragging && guides.length > 0) {
        const uniqueGuides = Array.from(
          new Map(guides.map((g) => [`${g.orientation}-${Math.round(g.position)}`, g])).values(),
        )
        setAlignmentGuides(uniqueGuides)
      } else if (isDragEnd) {
        setAlignmentGuides([])
      }

      if (syncChanges.length > 0) {
        setLocalNodes((nds) => applyNodeChanges(syncChanges, nds))
      }

      for (const change of syncChanges) {
        if (change.type === 'select') {
          setNodeSelected(change.id, change.selected)
        } else if (change.type === 'position' && change.position !== undefined) {
          updateNodePosition(change.id, change.position)
        } else if (change.type === 'remove') {
          globalCommandBus.execute(new DeleteNodesCommand([change.id], []))
        }
      }
    },
    [setNodeSelected, updateNodePosition],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (changes.length > 0) {
        setLocalEdges((eds) => applyEdgeChanges(changes, eds))
      }

      for (const change of changes) {
        if (change.type === 'select') {
          setEdgeSelected(change.id, change.selected)
        } else if (change.type === 'remove') {
          globalCommandBus.execute(new DeleteNodesCommand([], [change.id]))
        }
      }
    },
    [setEdgeSelected],
  )

  const connectionHandledRef = useRef(false)

  const onConnectStart: OnConnectStart = useCallback(() => {
    connectionHandledRef.current = false
    clearActiveSnap()
  }, [])

  const onConnect: OnConnect = useCallback(
    (params) => {
      connectionHandledRef.current = true
      const sourceNode = useBoundStore.getState().getNodeById(params.source)
      const isBusbar = sourceNode && BUSBAR_SOURCE_TYPES.has(sourceNode.type ?? '')
      const edgeId = `e-${params.source}-${params.target}-${Date.now()}`
      const newEdge: Edge = {
        id: edgeId,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
        type: isBusbar ? 'busbar' : 'orthogonal',
        data: isBusbar ? { voltage: 750, style: 'busbar' } : { voltage: 750, style: 'orthogonal' },
      }
      globalCommandBus.execute(new AddEdgeCommand(newEdge))
    },
    [],
  )

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      setStoreEdges((edges) => reconnectEdge(oldEdge, newConnection as Connection, edges))
    },
    [setStoreEdges],
  )

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (connectionHandledRef.current) {
        clearActiveSnap()
        return
      }

      const snap = getActiveSnap()
      const fromNode = connectionState.fromNode
      const fromHandle = connectionState.fromHandle
      const from = connectionState.from

      if (!fromNode || !fromHandle || !from) {
        clearActiveSnap()
        return
      }

      if (snap) {
        const originalEdge = useBoundStore.getState().getEdgeById(snap.edgeId)
        if (!originalEdge) {
          clearActiveSnap()
          return
        }

        globalCommandBus.execute(
          new BranchOnEdgeCommand({
            originalEdge,
            snap,
            sourceNodeId: fromNode.id,
            sourceHandleId: fromHandle.id ?? 'default',
            sourcePoint: from,
          }),
        )
        clearActiveSnap()
        return
      }

      // 允许固态变压器、AC/DC变换器、市电自由绘制到空白区域
      if (!BUSBAR_SOURCE_TYPES.has(fromNode.type ?? '')) {
        clearActiveSnap()
        return
      }

      const clientX = 'clientX' in event ? event.clientX : event.changedTouches[0]?.clientX ?? 0
      const clientY = 'clientY' in event ? event.clientY : event.changedTouches[0]?.clientY ?? 0
      const mousePosition = screenToFlowPosition({ x: clientX, y: clientY })

      const sourcePoint = getSourceHandlePoint(fromNode, fromHandle.id ?? undefined)
      const sourceOffset = getProspectiveBusbarPortOffset(fromNode.id, fromHandle.id ?? undefined)
      const busbarPoints = getBusbarPathPoints({
        sourceX: sourcePoint.x + sourceOffset.dx,
        sourceY: sourcePoint.y + sourceOffset.dy,
        sourcePosition: handleIdToPosition(fromHandle.id ?? undefined),
        targetX: mousePosition.x,
        targetY: mousePosition.y,
      })
      const endPoint = busbarPoints[busbarPoints.length - 1] ?? mousePosition

      const branchNodeId = `branch-${Date.now()}`
      const branchNode: Node = {
        id: branchNodeId,
        type: 'branch_point',
        position: { x: endPoint.x, y: endPoint.y },
        data: { orientation: 'horizontal' },
      }

      const edgeId = `e-${fromNode.id}-${branchNodeId}-${Date.now()}`
      const newEdge: Edge = {
        id: edgeId,
        source: fromNode.id,
        target: branchNodeId,
        sourceHandle: fromHandle.id ?? undefined,
        type: 'busbar',
        data: { voltage: 750, style: 'busbar' },
      }

      globalCommandBus.execute(new AddNodeCommand(branchNode))
      globalCommandBus.execute(new AddEdgeCommand(newEdge))
      clearActiveSnap()
    },
    [screenToFlowPosition],
  )

  const onViewportChange = useCallback(
    (vp: Viewport) => {
      const current = useBoundStore.getState().viewport
      if (current.x === vp.x && current.y === vp.y && current.zoom === vp.zoom) return
      setViewport(vp)
    },
    [setViewport],
  )

  useEffect(() => {
    const wrapper = flowWrapperRef.current
    if (!wrapper) return

    const isSelectingRef = { current: false }

    const finishSelection = (endClientX: number, endClientY: number) => {
      const startScreen = selectionBoxRef.current!.start
      const endScreen = { x: endClientX, y: endClientY }
      const startFlow = screenToFlowPosition(startScreen)
      const endFlow = screenToFlowPosition(endScreen)

      const box = {
        left: Math.min(startFlow.x, endFlow.x),
        top: Math.min(startFlow.y, endFlow.y),
        right: Math.max(startFlow.x, endFlow.x),
        bottom: Math.max(startFlow.y, endFlow.y),
      }

      const currentNodes = useBoundStore.getState().nodes
      const currentEdges = useBoundStore.getState().edges

      const selectedNodeIds = new Set<string>()
      for (const node of currentNodes) {
        const { width, height } = getNodeDimensions(node)
        const nodeLeft = node.position.x
        const nodeRight = node.position.x + width
        const nodeTop = node.position.y
        const nodeBottom = node.position.y + height

        const fullyContained =
          nodeLeft >= box.left &&
          nodeRight <= box.right &&
          nodeTop >= box.top &&
          nodeBottom <= box.bottom

        if (fullyContained) {
          selectedNodeIds.add(node.id)
        }
      }

      const selectedEdgeIds = new Set<string>()
      for (const edge of currentEdges) {
        if (selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)) {
          selectedEdgeIds.add(edge.id)
        }
      }

      setStoreNodes((nodes) =>
        nodes.map((n) => ({
          ...n,
          selected: selectedNodeIds.has(n.id),
        })),
      )
      setStoreEdges((edges) =>
        edges.map((e) => ({
          ...e,
          selected: selectedEdgeIds.has(e.id),
        })),
      )

      isSelectingRef.current = false
      selectionBoxRef.current = null
      setSelectionBox(null)
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 2) return
      event.preventDefault()
      event.stopPropagation()

      if (isSelectingRef.current) {
        finishSelection(event.clientX, event.clientY)
        return
      }

      const rect = wrapper.getBoundingClientRect()
      const screenPosition = { x: event.clientX, y: event.clientY }
      selectionBoxRef.current = { start: screenPosition, end: screenPosition }
      isSelectingRef.current = true
      setSelectionBox({
        start: screenPosition,
        end: screenPosition,
        wrapperRect: { left: rect.left, top: rect.top },
      })
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isSelectingRef.current) return
      event.preventDefault()

      const rect = wrapper.getBoundingClientRect()
      const screenPosition = { x: event.clientX, y: event.clientY }
      selectionBoxRef.current = { start: selectionBoxRef.current!.start, end: screenPosition }
      setSelectionBox({
        start: selectionBoxRef.current.start,
        end: screenPosition,
        wrapperRect: { left: rect.left, top: rect.top },
      })
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    wrapper.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('contextmenu', handleContextMenu, true)

    return () => {
      wrapper.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
    }
  }, [screenToFlowPosition, setStoreNodes, setStoreEdges])

  const minimapNodeColor = useMemo(() => {
    const colors: Record<string, string> = {
      power: '#dcfce7',
      converter: '#fef9c3',
      distribution: '#dbeafe',
      load: '#fee2e2',
      auxiliary: '#f3e8ff',
    }
    return (node: Node) => {
      const category = (node.data?.category as string) ?? 'auxiliary'
      return colors[category] ?? '#94a3b8'
    }
  }, [])

  return (
    <div ref={flowWrapperRef} className="w-full h-full relative">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onViewportChange={onViewportChange}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.Step}
        connectionLineComponent={SnappedConnectionLine}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        edgesReconnectable={true}
        onReconnect={onReconnect}
        snapToGrid={CANVAS_CONFIG.snapToGrid}
        snapGrid={SNAP_GRID}
        fitView={false}
        minZoom={CANVAS_CONFIG.minZoom}
        maxZoom={CANVAS_CONFIG.maxZoom}
        deleteKeyCode="Delete"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        proOptions={PRO_OPTIONS}
      >
        <AlignmentGuides guides={alignmentGuides} />
        <Controls showZoom={true} showFitView={true} showInteractive={false} className="export-ignore" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={minimapNodeColor}
          maskColor="rgba(15, 23, 42, 0.6)"
          className="!bg-scada-panel !border-scada-border !rounded-md export-ignore"
          style={MINIMAP_STYLE}
        />
      </ReactFlow>
      {selectionBox && (
        <SelectionBox
          start={selectionBox.start}
          end={selectionBox.end}
          wrapperRect={selectionBox.wrapperRect}
        />
      )}
    </div>
  )
}
