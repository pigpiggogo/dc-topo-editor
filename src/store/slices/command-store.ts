import type { StateCreator } from 'zustand'
import type { CommandBus } from '../../core/command/command-bus.ts'
import { eventBus } from '../../core/event-bus/event-bus.ts'

export interface CommandSlice {
  canUndo: boolean
  canRedo: boolean
  history: string[]
  isExecuting: boolean

  setCanUndo: (canUndo: boolean) => void
  setCanRedo: (canRedo: boolean) => void
  setHistory: (history: string[]) => void
  setIsExecuting: (isExecuting: boolean) => void
  syncWithCommandBus: (commandBus: CommandBus) => () => void
  undo: () => void
  redo: () => void
}

let globalCommandBus: CommandBus | null = null

export const createCommandSlice: StateCreator<CommandSlice, [], [], CommandSlice> = (set) => ({
  canUndo: false,
  canRedo: false,
  history: [],
  isExecuting: false,

  setCanUndo: (canUndo) => set({ canUndo }),
  setCanRedo: (canRedo) => set({ canRedo }),
  setHistory: (history) => set({ history }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),

  syncWithCommandBus: (commandBus) => {
    globalCommandBus = commandBus

    const update = (): void => {
      set({
        canUndo: commandBus.canUndo(),
        canRedo: commandBus.canRedo(),
        history: commandBus.getHistory(),
      })
      eventBus.emit('command.stackChanged', {
        canUndo: commandBus.canUndo(),
        canRedo: commandBus.canRedo(),
      })
    }

    // Initial sync
    update()

    // Subscribe to future changes
    const unsubscribe = commandBus.onStackChange((status) => {
      set({
        canUndo: status.canUndo,
        canRedo: status.canRedo,
      })
      eventBus.emit('command.stackChanged', status)
    })

    return unsubscribe
  },

  undo: () => {
    globalCommandBus?.undo()
  },
  redo: () => {
    globalCommandBus?.redo()
  },
})
