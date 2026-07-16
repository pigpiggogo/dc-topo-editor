import type { ReactElement } from 'react'

export interface BusSegmentProps {
  width: number
  height: number
  color: string
}

export function BusSegment(props: BusSegmentProps): ReactElement {
  const { width, height, color } = props

  return (
    <div
      className="rounded-sm"
      style={{
        width,
        height,
        backgroundColor: color,
        border: `2px solid ${color}`,
        opacity: 0.9,
      }}
    />
  )
}
