import type { ReactElement } from 'react'

interface SelectionBoxProps {
  start: { x: number; y: number }
  end: { x: number; y: number }
  wrapperRect: { left: number; top: number }
}

export function SelectionBox({ start, end, wrapperRect }: SelectionBoxProps): ReactElement | null {
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  const width = Math.abs(end.x - start.x)
  const height = Math.abs(end.y - start.y)

  const MIN_SIZE = 4
  const displayWidth = Math.max(width, MIN_SIZE)
  const displayHeight = Math.max(height, MIN_SIZE)

  return (
    <div
      className="absolute pointer-events-none border border-blue-500 bg-blue-500/10"
      style={{
        left: left - wrapperRect.left,
        top: top - wrapperRect.top,
        width: displayWidth,
        height: displayHeight,
        zIndex: 100,
      }}
    />
  )
}
