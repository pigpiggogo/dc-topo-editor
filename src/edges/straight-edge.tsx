import type { EdgeProps } from '@xyflow/react'
import { BaseEdge, getStraightPath } from '@xyflow/react'
import type { ReactElement } from 'react'

export function StraightEdge(props: EdgeProps): ReactElement {
  const { sourceX, sourceY, targetX, targetY, markerEnd, style } = props
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  )
}
