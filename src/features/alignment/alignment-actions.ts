import type { Node } from '@xyflow/react'
import { Command } from '@/core/command/command'
import { globalCommandBus } from '@/engine/command-bus-instance'
import { useBoundStore } from '@/store'

export type AlignmentType =
  | 'left'
  | 'right'
  | 'center-horizontal'
  | 'top'
  | 'bottom'
  | 'center-vertical'

export type DistributionType = 'horizontal' | 'vertical'

interface PositionSnapshot {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
}

const DEFAULT_NODE_WIDTH = 100
const DEFAULT_NODE_HEIGHT = 60

function getNodeWidth(node: Node): number {
  return node.width ?? node.measured?.width ?? DEFAULT_NODE_WIDTH
}

function getNodeHeight(node: Node): number {
  return node.height ?? node.measured?.height ?? DEFAULT_NODE_HEIGHT
}

interface NodeBounds {
  left: number
  right: number
  top: number
  bottom: number
}

function getNodeBounds(node: Node): NodeBounds {
  const w = getNodeWidth(node)
  const h = getNodeHeight(node)
  const x = node.position.x
  const y = node.position.y
  return {
    left: x,
    right: x + w,
    top: y,
    bottom: y + h,
  }
}

function computeAlignmentSnapshots(
  nodes: Node[],
  alignment: AlignmentType,
): PositionSnapshot[] {
  if (nodes.length < 2) return []

  const items = nodes.map((node) => ({
    node,
    bounds: getNodeBounds(node),
  }))

  let alignmentValue: number

  switch (alignment) {
    case 'left': {
      alignmentValue = Math.min(...items.map((item) => item.bounds.left))
      break
    }
    case 'right': {
      alignmentValue = Math.max(...items.map((item) => item.bounds.right))
      break
    }
    case 'center-horizontal': {
      const minLeft = Math.min(...items.map((item) => item.bounds.left))
      const maxRight = Math.max(...items.map((item) => item.bounds.right))
      alignmentValue = (minLeft + maxRight) / 2
      break
    }
    case 'top': {
      alignmentValue = Math.min(...items.map((item) => item.bounds.top))
      break
    }
    case 'bottom': {
      alignmentValue = Math.max(...items.map((item) => item.bounds.bottom))
      break
    }
    case 'center-vertical': {
      const minTop = Math.min(...items.map((item) => item.bounds.top))
      const maxBottom = Math.max(...items.map((item) => item.bounds.bottom))
      alignmentValue = (minTop + maxBottom) / 2
      break
    }
    default: {
      return []
    }
  }

  return items.map(({ node }) => {
    const w = getNodeWidth(node)
    const h = getNodeHeight(node)
    let newX = node.position.x
    let newY = node.position.y

    switch (alignment) {
      case 'left': {
        newX = alignmentValue
        break
      }
      case 'right': {
        newX = alignmentValue - w
        break
      }
      case 'center-horizontal': {
        newX = alignmentValue - w / 2
        break
      }
      case 'top': {
        newY = alignmentValue
        break
      }
      case 'bottom': {
        newY = alignmentValue - h
        break
      }
      case 'center-vertical': {
        newY = alignmentValue - h / 2
        break
      }
    }

    return {
      id: node.id,
      from: { x: node.position.x, y: node.position.y },
      to: { x: newX, y: newY },
    }
  })
}

function computeDistributionSnapshots(
  nodes: Node[],
  distribution: DistributionType,
): PositionSnapshot[] {
  if (nodes.length < 3) return []

  const items = nodes.map((node) => ({
    node,
    width: getNodeWidth(node),
    height: getNodeHeight(node),
    centerX: node.position.x + getNodeWidth(node) / 2,
    centerY: node.position.y + getNodeHeight(node) / 2,
  }))

  if (distribution === 'horizontal') {
    items.sort((a, b) => a.centerX - b.centerX)
  } else {
    items.sort((a, b) => a.centerY - b.centerY)
  }

  const first = items[0]
  const last = items[items.length - 1]

  const totalSpacing =
    distribution === 'horizontal'
      ? last.centerX - first.centerX
      : last.centerY - first.centerY

  const step = totalSpacing / (items.length - 1)

  return items.map((item, index) => {
    const w = item.width
    const h = item.height
    let newX = item.node.position.x
    let newY = item.node.position.y

    if (distribution === 'horizontal') {
      const targetCenterX = first.centerX + step * index
      newX = targetCenterX - w / 2
    } else {
      const targetCenterY = first.centerY + step * index
      newY = targetCenterY - h / 2
    }

    return {
      id: item.node.id,
      from: { x: item.node.position.x, y: item.node.position.y },
      to: { x: newX, y: newY },
    }
  })
}

function applyPositionUpdates(
  updates: Array<{ id: string; position: { x: number; y: number } }>,
): void {
  const setNodes = useBoundStore.getState().setNodes
  setNodes((nds) =>
    nds.map((n) => {
      const update = updates.find((u) => u.id === n.id)
      return update ? { ...n, position: update.position } : n
    }),
  )
}

class AlignNodesCommand extends Command {
  private readonly snapshots: PositionSnapshot[]
  private readonly alignment: AlignmentType

  constructor(nodes: Node[], alignment: AlignmentType) {
    super()
    this.alignment = alignment
    this.snapshots = computeAlignmentSnapshots(nodes, alignment)
  }

  execute(): void {
    applyPositionUpdates(
      this.snapshots.map((snapshot) => ({
        id: snapshot.id,
        position: snapshot.to,
      })),
    )
  }

  undo(): void {
    applyPositionUpdates(
      this.snapshots.map((snapshot) => ({
        id: snapshot.id,
        position: snapshot.from,
      })),
    )
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    const descriptionMap: Record<AlignmentType, string> = {
      left: '左对齐',
      right: '右对齐',
      'center-horizontal': '水平居中',
      top: '顶对齐',
      bottom: '底对齐',
      'center-vertical': '垂直居中',
    }
    return `对齐节点: ${descriptionMap[this.alignment]}`
  }
}

class DistributeNodesCommand extends Command {
  private readonly snapshots: PositionSnapshot[]
  private readonly distribution: DistributionType

  constructor(nodes: Node[], distribution: DistributionType) {
    super()
    this.distribution = distribution
    this.snapshots = computeDistributionSnapshots(nodes, distribution)
  }

  execute(): void {
    applyPositionUpdates(
      this.snapshots.map((snapshot) => ({
        id: snapshot.id,
        position: snapshot.to,
      })),
    )
  }

  undo(): void {
    applyPositionUpdates(
      this.snapshots.map((snapshot) => ({
        id: snapshot.id,
        position: snapshot.from,
      })),
    )
  }

  redo(): void {
    this.execute()
  }

  getDescription(): string {
    const descriptionMap: Record<DistributionType, string> = {
      horizontal: '水平等距分布',
      vertical: '垂直等距分布',
    }
    return `分布节点: ${descriptionMap[this.distribution]}`
  }
}

export function alignNodes(nodes: Node[], alignment: AlignmentType): void {
  if (nodes.length < 2) return
  const command = new AlignNodesCommand(nodes, alignment)
  globalCommandBus.execute(command)
}

export function distributeNodes(
  nodes: Node[],
  distribution: DistributionType,
): void {
  if (nodes.length < 3) return
  const command = new DistributeNodesCommand(nodes, distribution)
  globalCommandBus.execute(command)
}
