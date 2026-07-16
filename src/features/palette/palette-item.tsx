import type { ReactElement } from 'react'
import { useCallback } from 'react'
import {
  Sun,
  Battery,
  Shield,
  ArrowLeftRight,
  Minus,
  Plug,
  ArrowDown,
  ArrowUp,
  EvCharger,
  Gauge,
  Building2,
  Cpu,
  ArrowRightLeft,
  Zap,
  GitBranch,
} from 'lucide-react'
import { DEVICE_METADATA } from '@/constants/device-metadata'
import { pluginManager } from '@/engine/plugin-instance'
import { globalCommandBus } from '@/engine/command-bus-instance'
import { AddNodeCommand } from '@/commands'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Battery,
  Shield,
  ArrowLeftRight,
  Minus,
  Plug,
  ArrowDown,
  ArrowUp,
  EvCharger,
  Gauge,
  Building2,
  Cpu,
  ArrowRightLeft,
  Zap,
  GitBranch,
}

function getIconComponent(iconName: string): React.ComponentType<{ className?: string }> {
  return ICON_MAP[iconName] ?? Zap
}

function generateNodeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'node-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

function generatePosition(): { x: number; y: number } {
  return {
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
  }
}

type PaletteItemProps = {
  deviceType: string
}

export function PaletteItem({ deviceType }: PaletteItemProps): ReactElement {
  const meta = DEVICE_METADATA[deviceType]

  const handleClick = useCallback(() => {
    const plugin = pluginManager.getPlugin(deviceType)
    if (!plugin) return

    const defaultData = plugin.defaultData()
    const ports = plugin.getPorts()
    const nodeId = generateNodeId()
    const position = generatePosition()

    const node = {
      id: nodeId,
      type: deviceType,
      position,
      data: { ...defaultData, ports },
    }

    globalCommandBus.execute(new AddNodeCommand(node, { ...defaultData, ports }))
  }, [deviceType])

  if (!meta) {
    return <div className="px-2 py-1 text-xs text-scada-text-muted">未知设备</div>
  }

  const IconComponent = getIconComponent(meta.icon)

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-scada-text hover:bg-scada-border/30 transition-colors cursor-pointer"
    >
      <span className="flex-shrink-0">
        <IconComponent className="w-4 h-4 text-scada-text-muted" />
      </span>
      <span className="truncate font-medium">{meta.name}</span>
    </button>
  )
}
