import type { Edge, Node } from '@xyflow/react'
import { Command } from '../core/command/command.ts'
import { useBoundStore } from '../store/index.ts'

export class DeleteNodesCommand extends Command {
  private readonly nodeSnapshots: Node[]
  private readonly edgeSnapshots: Edge[]

  constructor(nodeIds: string[], edgeIds: string[]) {
    super()
    const state = useBoundStore.getState()

    this.nodeSnapshots = nodeIds
      .map((id) => state.getNodeById(id))
      .filter((node): node is Node => node !== undefined)

    const connectedEdges = state.edges.filter(
      (e) => nodeIds.includes(e.source) || nodeIds.includes(e.target),
    )
    const explicitEdges = edgeIds
      .map((id) => state.edges.find((e) => e.id === id))
      .filter((edge): edge is Edge => edge !== undefined)

    const edgeMap = new Map<string, Edge>()
    for (const edge of [...connectedEdges, ...explicitEdges]) {
      edgeMap.set(edge.id, edge)
    }
    this.edgeSnapshots = Array.from(edgeMap.values())
  }

  execute(): void {
    const store = useBoundStore.getState()

    for (const node of this.nodeSnapshots) {
      store.removeNode(node.id)
    }

    for (const edge of this.edgeSnapshots) {
      if (store.edges.some((e) => e.id === edge.id)) {
        store.removeEdge(edge.id)
      }
    }
  }

  undo(): void {
    const store = useBoundStore.getState()

    for (const node of this.nodeSnapshots) {
      store.addNode(node)
    }

    for (const edge of this.edgeSnapshots) {
      store.addEdge(edge)
    }
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    return '删除选中元素'
  }
}
