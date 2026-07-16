import type { ReactElement } from 'react'

export interface BusResizeHandleProps {
  edge: 'start' | 'end'
  orientation: 'horizontal' | 'vertical'
  onResizeStart: (edge: 'start' | 'end') => (e: React.MouseEvent) => void
}

export function BusResizeHandle(props: BusResizeHandleProps): ReactElement {
  const { edge, orientation, onResizeStart } = props
  const isHorizontal = orientation === 'horizontal'
  const isEnd = edge === 'end'

  const style: React.CSSProperties = {
    position: 'absolute',
    width: isHorizontal ? 10 : 14,
    height: isHorizontal ? 14 : 10,
    backgroundColor: '#3b82f6',
    border: '2px solid #1e40af',
    borderRadius: 2,
    cursor: isHorizontal ? 'col-resize' : 'row-resize',
    zIndex: 10,
  }

  if (isHorizontal) {
    style.top = '50%'
    style.transform = 'translateY(-50%)'
    style[isEnd ? 'right' : 'left'] = -5
  } else {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
    style[isEnd ? 'bottom' : 'top'] = -5
  }

  return (
    <div
      style={style}
      onMouseDown={onResizeStart(edge)}
      role="button"
      aria-label={`resize-${edge}`}
      tabIndex={0}
      className="nodrag nopan"
    />
  )
}
