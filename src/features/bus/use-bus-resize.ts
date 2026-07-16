import { useState, useCallback, useRef, useEffect } from 'react'
import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react'

export interface BusResizeState {
  width: number
  height: number
  isResizing: boolean
  startResize: (edge: 'start' | 'end') => (e: React.MouseEvent) => void
}

export function useBusResize(
  nodeId: string,
  initialWidth: number,
  initialHeight: number,
  orientation: 'horizontal' | 'vertical',
  minWidth: number = 80,
  minHeight: number = 20,
): BusResizeState {
  const { updateNode, updateNodeData, getNode } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()

  const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight })
  const [isResizing, setIsResizing] = useState(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const startDimensionsRef = useRef({ width: initialWidth, height: initialHeight })
  const currentDimensionsRef = useRef({ width: initialWidth, height: initialHeight })

  // Sync dimensions when external data changes (e.g., property panel) but not while dragging
  useEffect(() => {
    if (!isResizing) {
      setDimensions({ width: initialWidth, height: initialHeight })
      currentDimensionsRef.current = { width: initialWidth, height: initialHeight }
    }
  }, [initialWidth, initialHeight, isResizing])

  const startResize = useCallback(
    (edge: 'start' | 'end') => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      startPosRef.current = { x: e.clientX, y: e.clientY }
      startDimensionsRef.current = { width: dimensions.width, height: dimensions.height }
      currentDimensionsRef.current = { width: dimensions.width, height: dimensions.height }

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        const dx = moveEvent.clientX - startPosRef.current.x
        const dy = moveEvent.clientY - startPosRef.current.y

        let newWidth = startDimensionsRef.current.width
        let newHeight = startDimensionsRef.current.height

        if (orientation === 'horizontal') {
          if (edge === 'end') {
            newWidth = Math.max(minWidth, startDimensionsRef.current.width + dx)
          } else {
            newWidth = Math.max(minWidth, startDimensionsRef.current.width - dx)
          }
        } else {
          if (edge === 'end') {
            newHeight = Math.max(minHeight, startDimensionsRef.current.height + dy)
          } else {
            newHeight = Math.max(minHeight, startDimensionsRef.current.height - dy)
          }
        }

        currentDimensionsRef.current = { width: newWidth, height: newHeight }
        setDimensions({ width: newWidth, height: newHeight })
      }

      const handleMouseUp = (): void => {
        setIsResizing(false)
        const finalDims = currentDimensionsRef.current

        // Persist dimensions in node data
        updateNodeData(nodeId, { width: finalDims.width, height: finalDims.height } as Record<string, unknown>)

        // If resizing from the start edge, adjust node position so the far end stays fixed
        if (edge === 'start') {
          const node = getNode(nodeId)
          if (node && node.position) {
            if (orientation === 'horizontal') {
              const dx = startDimensionsRef.current.width - finalDims.width
              updateNode(nodeId, {
                position: { x: node.position.x + dx, y: node.position.y } as { x: number; y: number },
              })
            } else {
              const dy = startDimensionsRef.current.height - finalDims.height
              updateNode(nodeId, {
                position: { x: node.position.x, y: node.position.y + dy } as { x: number; y: number },
              })
            }
          }
        }

        // Let React Flow remeasure handles after the DOM update
        window.setTimeout(() => {
          updateNodeInternals(nodeId)
        }, 10)

        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [dimensions, orientation, nodeId, getNode, updateNode, updateNodeData, updateNodeInternals, minWidth, minHeight],
  )

  return {
    width: dimensions.width,
    height: dimensions.height,
    isResizing,
    startResize,
  }
}
