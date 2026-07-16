import type { Edge, Node, Position as RFPosition, XYPosition } from '@xyflow/react'
import { Command } from '../core/command/command.ts'
import { useBoundStore } from '../store/index.ts'
import { BUSBAR_SOURCE_TYPES } from '../edges/busbar-port-fanout.ts'

function generateNodeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'junction-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

function generateEdgeId(): string {
  return 'e-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

interface SnapInfo {
  edgeId: string
  point: XYPosition
  orientation: 'horizontal' | 'vertical'
  handlePosition: RFPosition
}

export interface BranchOnEdgeCommandOptions {
  originalEdge: Edge
  snap: SnapInfo
  sourceNodeId: string
  sourceHandleId: string
  sourcePoint: XYPosition
}

export class BranchOnEdgeCommand extends Command {
  private readonly originalEdge: Edge
  private readonly junctionNode: Node
  private readonly splitSourceEdge: Edge | null
  private readonly splitTargetEdge: Edge | null
  private readonly branchEdge: Edge

  constructor(options: BranchOnEdgeCommandOptions) {
    super()
    this.originalEdge = options.originalEdge

    const { snap, sourceNodeId, sourceHandleId, sourcePoint } = options
    const isHorizontal = snap.orientation === 'horizontal'
    const junctionId = generateNodeId()

    this.junctionNode = {
      id: junctionId,
      type: 'branch_point',
      position: {
        x: snap.point.x,
        y: snap.point.y,
      },
      data: { orientation: snap.orientation },
    }

    const branchHandle = isHorizontal
      ? sourcePoint.y <= snap.point.y
        ? 'branch-a'
        : 'branch-b'
      : sourcePoint.x <= snap.point.x
        ? 'branch-a'
        : 'branch-b'

    const sourceNode = useBoundStore.getState().getNodeById(sourceNodeId)
    const isBusbarSource = sourceNode ? BUSBAR_SOURCE_TYPES.has(sourceNode.type ?? '') : false

    this.branchEdge = {
      id: generateEdgeId(),
      source: sourceNodeId,
      target: junctionId,
      sourceHandle: sourceHandleId,
      targetHandle: branchHandle,
      type: isBusbarSource ? 'busbar' : 'orthogonal',
      data: isBusbarSource ? { voltage: 750, style: 'busbar' } : { ...(options.originalEdge.data ?? {}), style: 'orthogonal' },
    }

    if (options.originalEdge.type === 'busbar') {
      // 母线不被断开：只在母线上生成一个不可见的分支点，连入新线
      this.splitSourceEdge = null
      this.splitTargetEdge = null
      return
    }

    const originalData = options.originalEdge.data ?? { voltage: 750, style: 'orthogonal' }

    this.splitSourceEdge = {
      id: generateEdgeId(),
      source: options.originalEdge.source,
      target: junctionId,
      sourceHandle: options.originalEdge.sourceHandle,
      targetHandle: 'inline-start',
      type: 'orthogonal',
      data: originalData,
    }

    this.splitTargetEdge = {
      id: generateEdgeId(),
      source: junctionId,
      target: options.originalEdge.target,
      sourceHandle: 'inline-end',
      targetHandle: options.originalEdge.targetHandle,
      type: 'orthogonal',
      data: originalData,
    }
  }

  execute(): void {
    const store = useBoundStore.getState()
    store.addNode(this.junctionNode)
    store.addEdge(this.branchEdge)

    if (this.splitSourceEdge && this.splitTargetEdge) {
      store.removeEdge(this.originalEdge.id)
      store.addEdge(this.splitSourceEdge)
      store.addEdge(this.splitTargetEdge)
    }
  }

  undo(): void {
    const store = useBoundStore.getState()
    if (this.splitSourceEdge && this.splitTargetEdge) {
      store.removeEdge(this.splitSourceEdge.id)
      store.removeEdge(this.splitTargetEdge.id)
      store.addEdge(this.originalEdge)
    }
    store.removeEdge(this.branchEdge.id)
    store.removeNode(this.junctionNode.id)
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    return this.originalEdge.type === 'busbar' ? '在母线上接入分支' : '在连线上分支'
  }
}
