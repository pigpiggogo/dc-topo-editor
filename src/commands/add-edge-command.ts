import type { Edge } from '@xyflow/react'
import { Command } from '../core/command/command.ts'
import { useBoundStore } from '../store/index.ts'

export class AddEdgeCommand extends Command {
  private readonly edge: Edge

  constructor(edge: Edge) {
    super()
    this.edge = edge
  }

  execute(): void {
    useBoundStore.getState().addEdge(this.edge)
  }

  undo(): void {
    useBoundStore.getState().removeEdge(this.edge.id)
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    return '添加连线'
  }
}
