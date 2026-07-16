export const CANVAS_CONFIG = {
  gridSize: 1,
  snapToGrid: true,
  minZoom: 0.1,
  maxZoom: 5,
  defaultZoom: 1,
  defaultViewport: { x: 0, y: 0, zoom: 1 },
  nodeMinWidth: 80,
  nodeMinHeight: 60,
  nodeMaxWidth: 400,
  nodeMaxHeight: 300,
  deleteKeyCode: 'Delete',
} as const

export const NODE_ROTATION_STEPS = [0, 90, 180, 270] as const

export type NodeRotation = (typeof NODE_ROTATION_STEPS)[number]
