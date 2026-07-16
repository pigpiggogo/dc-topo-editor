import type { StateCreator } from 'zustand'
import { eventBus } from '../../core/event-bus/event-bus.ts'

export interface PluginSlice {
  installedPlugins: string[]
  activePluginCategories: string[]

  markInstalled: (pluginId: string) => void
  markUninstalled: (pluginId: string) => void
  setActivePluginCategories: (categories: string[]) => void
  togglePluginCategory: (category: string) => void
}

export const createPluginSlice: StateCreator<PluginSlice, [], [], PluginSlice> = (set) => ({
  installedPlugins: [],
  activePluginCategories: ['power', 'converter', 'distribution', 'load', 'auxiliary'],

  markInstalled: (pluginId) =>
    set((state) => {
      if (state.installedPlugins.includes(pluginId)) return state
      eventBus.emit('plugin.installed', { pluginId })
      return { installedPlugins: [...state.installedPlugins, pluginId] }
    }),

  markUninstalled: (pluginId) =>
    set((state) => {
      eventBus.emit('plugin.uninstalled', { pluginId })
      return { installedPlugins: state.installedPlugins.filter((id) => id !== pluginId) }
    }),

  setActivePluginCategories: (categories) => set({ activePluginCategories: categories }),

  togglePluginCategory: (category) =>
    set((state) => {
      const active = new Set(state.activePluginCategories)
      if (active.has(category)) {
        active.delete(category)
      } else {
        active.add(category)
      }
      return { activePluginCategories: Array.from(active) }
    }),
})
