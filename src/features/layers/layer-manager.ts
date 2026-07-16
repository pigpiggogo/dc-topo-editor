import type { LayerType } from '@/types'
import { LAYERS } from '@/constants'

export function getLayerZIndex(layerType: LayerType): number {
  const config = LAYERS.find((l) => l.id === layerType)
  return config?.zIndex ?? 10
}

export function getDefaultLayer(): LayerType {
  return 'device'
}

export function getLayerName(layerType: LayerType): string {
  const config = LAYERS.find((l) => l.id === layerType)
  return config?.name ?? layerType
}
