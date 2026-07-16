import type { ICommand } from './types'

export abstract class Command implements ICommand {
  readonly id: string
  readonly timestamp: number

  constructor() {
    this.id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    this.timestamp = Date.now()
  }

  abstract execute(): void
  abstract undo(): void
  abstract redo(): void
  abstract getDescription(): string
}
