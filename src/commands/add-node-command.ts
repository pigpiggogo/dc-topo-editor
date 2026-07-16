import type { Node } from '@xyflow/react'
import { Command } from '../core/command/command.ts'
import { useBoundStore } from '../store/index.ts'

export class AddNodeCommand extends Command {
  private readonly node: Node
  private readonly deviceData: Record<string, unknown> | undefined

  constructor(node: Node, deviceData?: Record<string, unknown>) {
    super()
    this.node = node
    this.deviceData = deviceData
  }

  execute(): void {
    const store = useBoundStore.getState()
    store.addNode(this.node)
    if (this.deviceData !== undefined) {
      store.setDeviceData(this.node.id, this.deviceData)
    }
  }

  undo(): void {
    useBoundStore.getState().removeNode(this.node.id)
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    return `添加节点 ${this.node.data?.name ?? this.node.id}`
  }
}
