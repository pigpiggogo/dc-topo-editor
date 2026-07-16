import type { Edge, Node } from '@xyflow/react'
import { Command } from '../core/command/command.ts'
import { useBoundStore } from '../store/index.ts'

export class ClearCanvasCommand extends Command {
  private readonly nodeSnapshots: Node[]
  private readonly edgeSnapshots: Edge[]
  private readonly deviceDataSnapshot: Map<string, Record<string, unknown>>

  constructor() {
    super()
    const state = useBoundStore.getState()
    this.nodeSnapshots = [...state.nodes]
    this.edgeSnapshots = [...state.edges]
    this.deviceDataSnapshot = new Map(state.deviceData)
  }

  execute(): void {
    useBoundStore.setState({
      nodes: [],
      edges: [],
      deviceData: new Map(),
    })
  }

  undo(): void {
    useBoundStore.setState({
      nodes: this.nodeSnapshots,
      edges: this.edgeSnapshots,
      deviceData: new Map(this.deviceDataSnapshot),
    })
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    return '清空画布'
  }
}
