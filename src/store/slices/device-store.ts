import type { StateCreator } from 'zustand'
import { eventBus } from '../../core/event-bus/event-bus.ts'

export interface DeviceSlice {
  deviceData: Map<string, Record<string, unknown>>

  setDeviceData: (nodeId: string, data: Record<string, unknown>) => void
  updateDeviceProperty: (nodeId: string, key: string, value: unknown) => void
  removeDeviceData: (nodeId: string) => void

  getDeviceData: (nodeId: string) => Record<string, unknown> | undefined
  getDeviceProperty: (nodeId: string, key: string) => unknown
}

export const createDeviceSlice: StateCreator<DeviceSlice, [], [], DeviceSlice> = (set, get) => ({
  deviceData: new Map(),

  setDeviceData: (nodeId, data) =>
    set((state) => {
      const next = new Map(state.deviceData)
      next.set(nodeId, data)
      return { deviceData: next }
    }),

  updateDeviceProperty: (nodeId, key, value) =>
    set((state) => {
      const next = new Map(state.deviceData)
      const existing = next.get(nodeId) ?? {}
      next.set(nodeId, { ...existing, [key]: value })

      eventBus.emit('device.propertyChanged', { nodeId, key, value })
      return { deviceData: next }
    }),

  removeDeviceData: (nodeId) =>
    set((state) => {
      const next = new Map(state.deviceData)
      next.delete(nodeId)
      return { deviceData: next }
    }),

  getDeviceData: (nodeId) => get().deviceData.get(nodeId),

  getDeviceProperty: (nodeId, key) => {
    const data = get().deviceData.get(nodeId)
    return data?.[key]
  },
})
