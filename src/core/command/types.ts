export interface ICommand {
  readonly id: string
  readonly timestamp: number
  execute(): void
  undo(): void
  redo(): void
  getDescription(): string
}

export interface CommandBusState {
  canUndo: boolean
  canRedo: boolean
  history: string[]
  isExecuting: boolean
}
