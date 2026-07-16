import { HISTORY_LIMIT } from '../../constants/index.ts'
import { createEventBus } from '../event-bus/event-bus.ts'
import type { ICommand } from './types.ts'

export class CommandBus {
  private readonly undoStack: ICommand[]
  private readonly redoStack: ICommand[]
  private isExecuting: boolean
  private readonly listeners: Set<(status: { canUndo: boolean; canRedo: boolean }) => void>

  constructor() {
    this.undoStack = []
    this.redoStack = []
    this.isExecuting = false
    this.listeners = new Set()
  }

  execute(command: ICommand): void {
    if (this.isExecuting) {
      throw new Error('CommandBus: cannot execute command while another is executing')
    }

    this.isExecuting = true
    try {
      command.execute()
      this.undoStack.push(command)
      this.redoStack.length = 0

      this.trimUndoStack()
      this.emitState()
    } finally {
      this.isExecuting = false
    }
  }

  undo(): void {
    if (this.undoStack.length === 0) return

    const command = this.undoStack.pop()
    if (command === undefined) return

    command.undo()
    this.redoStack.push(command)
    this.emitState()
  }

  redo(): void {
    if (this.redoStack.length === 0) return

    const command = this.redoStack.pop()
    if (command === undefined) return

    command.redo()
    this.undoStack.push(command)
    this.emitState()
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  getHistory(): string[] {
    return this.undoStack.map((cmd) => cmd.getDescription())
  }

  clear(): void {
    this.undoStack.length = 0
    this.redoStack.length = 0
    this.emitState()
  }

  getUndoCount(): number {
    return this.undoStack.length
  }

  getRedoCount(): number {
    return this.redoStack.length
  }

  onStackChange(handler: (status: { canUndo: boolean; canRedo: boolean }) => void): () => void {
    this.listeners.add(handler)
    return () => {
      this.listeners.delete(handler)
    }
  }

  private trimUndoStack(): void {
    while (this.undoStack.length > HISTORY_LIMIT) {
      this.undoStack.shift()
    }
  }

  private emitState(): void {
    const status = {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    }

    for (const listener of this.listeners) {
      listener(status)
    }

    const bus = createEventBus()
    bus.emit('command.stackChanged', status)
  }
}

export function createCommandBus(): CommandBus {
  return new CommandBus()
}
