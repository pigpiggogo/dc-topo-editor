import type { NodeProps } from '@xyflow/react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import type { ReactElement } from 'react'
import { useMemo, useEffect } from 'react'
import { getVoltageColor } from '@/constants/voltage-colors'
import { useBusResize } from './use-bus-resize'
import { BusResizeHandle } from './bus-resize-handle'
import { BusSegment } from './bus-segment'
import { BusBranchPoint } from './bus-branch-point'

export interface BusNodeData {
  name?: string
  orientation?: 'horizontal' | 'vertical'
  voltageLevel?: number
  ratedCurrent?: number
  width?: number
  height?: number
  numBranches?: number
}

export function BusNode(props: NodeProps): ReactElement {
  const { id, data, selected } = props
  const nodeData = data as BusNodeData | undefined

  const orientation = nodeData?.orientation ?? 'horizontal'
  const voltageLevel = nodeData?.voltageLevel ?? 750
  const ratedCurrent = nodeData?.ratedCurrent ?? 500
  const name = nodeData?.name ?? '直流母线'
  const numBranches = nodeData?.numBranches ?? 4

  const initialWidth = nodeData?.width ?? (orientation === 'horizontal' ? 200 : 20)
  const initialHeight = nodeData?.height ?? (orientation === 'horizontal' ? 20 : 200)

  const { width, height, isResizing, startResize } = useBusResize(
    id,
    initialWidth,
    initialHeight,
    orientation,
  )

  const updateNodeInternals = useUpdateNodeInternals()

  // Notify React Flow when handle layout changes (dimensions, branch count, orientation)
  useEffect(() => {
    if (!isResizing) {
      updateNodeInternals(id)
    }
  }, [id, width, height, numBranches, orientation, isResizing, updateNodeInternals])

  const voltageColor = getVoltageColor(voltageLevel)

  // Generate T-branch points dynamically based on bus length and requested branch count
  const branchPoints = useMemo(() => {
    const points: Array<{ x: number; y: number; id: string }> = []
    const isHorizontal = orientation === 'horizontal'
    const lengthPx = isHorizontal ? width : height
    const maxByLength = Math.max(2, Math.floor(lengthPx / 40))
    const count = Math.max(2, Math.min(numBranches, maxByLength))

    if (isHorizontal) {
      const step = width / (count + 1)
      for (let i = 1; i <= count; i++) {
        points.push({ x: step * i, y: height / 2, id: `branch-${i}` })
      }
    } else {
      const step = height / (count + 1)
      for (let i = 1; i <= count; i++) {
        points.push({ x: width / 2, y: step * i, id: `branch-${i}` })
      }
    }
    return points
  }, [width, height, numBranches, orientation])

  // Main end handles for bus-to-bus or bus-to-device connections
  const mainHandles = useMemo(() => {
    if (orientation === 'horizontal') {
      return [
        { id: 'port-start', position: Position.Left, x: 0, y: height / 2 },
        { id: 'port-end', position: Position.Right, x: width, y: height / 2 },
      ]
    } else {
      return [
        { id: 'port-start', position: Position.Top, x: width / 2, y: 0 },
        { id: 'port-end', position: Position.Bottom, x: width / 2, y: height },
      ]
    }
  }, [width, height, orientation])

  return (
    <div
      className="relative group"
      style={{
        width,
        height,
        opacity: isResizing ? 0.8 : 1,
      }}
    >
      {/* Bus bar visual */}
      <BusSegment width={width} height={height} color={voltageColor} />

      {/* Name label */}
      <div
        className="absolute text-[9px] font-medium px-1 whitespace-nowrap pointer-events-none"
        style={{
          top: orientation === 'horizontal' ? -16 : '50%',
          left: orientation === 'horizontal' ? '50%' : -16,
          transform: orientation === 'horizontal' ? 'translateX(-50%)' : 'translate(-100%, -50%)',
          color: '#1e293b',
        }}
      >
        {name}
      </div>

      {/* Current rating label */}
      <div
        className="absolute text-[8px] pointer-events-none"
        style={{
          bottom: orientation === 'horizontal' ? -14 : '50%',
          right: orientation === 'horizontal' ? '50%' : -14,
          transform: orientation === 'horizontal' ? 'translateX(50%)' : 'translate(0, -50%)',
          color: '#475569',
        }}
      >
        {ratedCurrent}A
      </div>

      {/* Main end handles */}
      {mainHandles.map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={h.position}
          isConnectableStart={true}
          isConnectableEnd={true}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200"
          style={{
            position: 'absolute',
            left: h.x,
            top: h.y,
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            backgroundColor: '#f59e0b',
            border: '2px solid #0f172a',
            zIndex: 10,
          }}
        />
      ))}

      {/* T-branch points */}
      {branchPoints.map((bp) => (
        <BusBranchPoint
          key={bp.id}
          id={bp.id}
          x={bp.x}
          y={bp.y}
          orientation={orientation}
        />
      ))}

      {/* Resize handles (visible when selected) */}
      {selected && (
        <>
          <BusResizeHandle
            edge="start"
            orientation={orientation}
            onResizeStart={startResize}
          />
          <BusResizeHandle
            edge="end"
            orientation={orientation}
            onResizeStart={startResize}
          />
        </>
      )}
    </div>
  )
}
