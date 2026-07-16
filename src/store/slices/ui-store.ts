import type { StateCreator } from 'zustand'
import { eventBus } from '../../core/event-bus/event-bus.ts'

export interface UISlice {
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  activeTab: string
  zoom: number
  theme: 'light' | 'dark' | 'system'

  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  setLeftPanel: (open: boolean) => void
  setRightPanel: (open: boolean) => void
  setActiveTab: (tab: string) => void
  setZoom: (zoom: number) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  activeTab: 'devices',
  zoom: 1,
  theme: 'dark',

  toggleLeftPanel: () =>
    set((state) => {
      const open = !state.leftPanelOpen
      eventBus.emit('ui.panelToggled', { panel: 'left', open })
      return { leftPanelOpen: open }
    }),

  toggleRightPanel: () =>
    set((state) => {
      const open = !state.rightPanelOpen
      eventBus.emit('ui.panelToggled', { panel: 'right', open })
      return { rightPanelOpen: open }
    }),

  setLeftPanel: (open) =>
    set(() => {
      eventBus.emit('ui.panelToggled', { panel: 'left', open })
      return { leftPanelOpen: open }
    }),

  setRightPanel: (open) =>
    set(() => {
      eventBus.emit('ui.panelToggled', { panel: 'right', open })
      return { rightPanelOpen: open }
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setZoom: (zoom) => set({ zoom }),
  setTheme: (theme) => set({ theme }),
})
