import type { ReactElement } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { CanvasEngine, initializeDefaultPlugins } from '@/engine'
import { useCallback } from 'react'

export function CanvasContainer(): ReactElement {
  const onInit = useCallback(() => {
    initializeDefaultPlugins()
  }, [])

  return (
    <ReactFlowProvider>
      <CanvasEngine onInit={onInit} />
    </ReactFlowProvider>
  )
}
