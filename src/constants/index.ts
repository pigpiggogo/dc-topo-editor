export {
  VOLTAGE_COLORS,
  VOLTAGE_COLOR_UNKNOWN,
  getVoltageColor,
} from './voltage-colors.ts'

export { DEVICE_CATEGORIES, DEVICE_METADATA } from './device-metadata.ts'

export { CANVAS_CONFIG, NODE_ROTATION_STEPS } from './canvas-config.ts'
export type { NodeRotation } from './canvas-config.ts'

export const HISTORY_LIMIT = 100
export const DEFAULT_THEME = 'dark' as const
export const AUTO_SAVE_INTERVAL = 30000
export const FILE_EXTENSION = '.dtopo'
export const APP_VERSION = '1.0.0'

export const PERFORMANCE_TARGETS = {
  maxNodes: 200,
  targetFps: 60,
  export4KTimeout: 5000,
  firstLoadTimeout: 3000,
  undoRedoLatency: 16,
} as const

export const EXPORT_RESOLUTIONS = [
  { value: 1, label: '1x (标准)' },
  { value: 2, label: '2x (高清)' },
  { value: 4, label: '4x (4K)' },
] as const

export const LAYERS = [
  { id: 'background', name: '背景层', zIndex: 0, visible: true, locked: true },
  { id: 'device', name: '设备层', zIndex: 10, visible: true, locked: false },
  { id: 'annotation', name: '标注层', zIndex: 20, visible: true, locked: false },
] as const
