import { create } from 'zustand'
import { createUISlice } from './slices/ui-store.ts'
import { createCanvasSlice } from './slices/canvas-store.ts'
import { createDeviceSlice } from './slices/device-store.ts'
import { createCommandSlice } from './slices/command-store.ts'
import { createPluginSlice } from './slices/plugin-store.ts'
import type { AllSlices } from './selectors/combined-selectors.ts'

export const useBoundStore = create<AllSlices>()((...a) => ({
  ...createUISlice(...a),
  ...createCanvasSlice(...a),
  ...createDeviceSlice(...a),
  ...createCommandSlice(...a),
  ...createPluginSlice(...a),
}))
