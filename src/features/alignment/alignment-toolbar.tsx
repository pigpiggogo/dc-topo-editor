import type { ReactElement } from 'react'
import { useCallback } from 'react'
import {
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from 'lucide-react'
import { useBoundStore } from '@/store'
import {
  alignNodes,
  distributeNodes,
  type AlignmentType,
  type DistributionType,
} from './alignment-actions'

interface ToolbarButtonData {
  key: string
  label: string
  icon: ReactElement
  action: () => void
  enabled: boolean
}

export function AlignmentToolbar(): ReactElement | null {
  const nodes = useBoundStore((state) => state.nodes)
  const selectedNodes = nodes.filter((n) => n.selected)
  const hasMultiSelection = selectedNodes.length >= 2
  const hasThreeOrMore = selectedNodes.length >= 3

  const handleAlign = useCallback(
    (alignment: AlignmentType) => () => {
      alignNodes(selectedNodes, alignment)
    },
    [selectedNodes],
  )

  const handleDistribute = useCallback(
    (distribution: DistributionType) => () => {
      distributeNodes(selectedNodes, distribution)
    },
    [selectedNodes],
  )

  if (!hasMultiSelection) {
    return null
  }

  const buttons: ToolbarButtonData[] = [
    {
      key: 'align-left',
      label: '左对齐',
      icon: <AlignLeft className="w-3.5 h-3.5" />,
      action: handleAlign('left'),
      enabled: hasMultiSelection,
    },
    {
      key: 'align-center-horizontal',
      label: '水平居中',
      icon: <AlignCenterHorizontal className="w-3.5 h-3.5" />,
      action: handleAlign('center-horizontal'),
      enabled: hasMultiSelection,
    },
    {
      key: 'align-right',
      label: '右对齐',
      icon: <AlignRight className="w-3.5 h-3.5" />,
      action: handleAlign('right'),
      enabled: hasMultiSelection,
    },
    {
      key: 'separator-1',
      label: '',
      icon: <div className="w-px h-4 bg-scada-border" />,
      action: () => {},
      enabled: false,
    },
    {
      key: 'align-top',
      label: '顶对齐',
      icon: <AlignStartVertical className="w-3.5 h-3.5" />,
      action: handleAlign('top'),
      enabled: hasMultiSelection,
    },
    {
      key: 'align-center-vertical',
      label: '垂直居中',
      icon: <AlignCenterVertical className="w-3.5 h-3.5" />,
      action: handleAlign('center-vertical'),
      enabled: hasMultiSelection,
    },
    {
      key: 'align-bottom',
      label: '底对齐',
      icon: <AlignEndVertical className="w-3.5 h-3.5" />,
      action: handleAlign('bottom'),
      enabled: hasMultiSelection,
    },
    {
      key: 'separator-2',
      label: '',
      icon: <div className="w-px h-4 bg-scada-border" />,
      action: () => {},
      enabled: false,
    },
    {
      key: 'distribute-horizontal',
      label: '水平等距分布',
      icon: <AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />,
      action: handleDistribute('horizontal'),
      enabled: hasThreeOrMore,
    },
    {
      key: 'distribute-vertical',
      label: '垂直等距分布',
      icon: <AlignVerticalDistributeCenter className="w-3.5 h-3.5" />,
      action: handleDistribute('vertical'),
      enabled: hasThreeOrMore,
    },
  ]

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-scada-panel border border-scada-border rounded-md shadow-sm">
      {buttons.map((button) => {
        if (button.key.startsWith('separator')) {
          return (
            <div key={button.key} className="flex items-center">
              {button.icon}
            </div>
          )
        }

        return (
          <button
            key={button.key}
            type="button"
            title={button.label}
            onClick={button.action}
            disabled={!button.enabled}
            className="flex items-center justify-center w-7 h-7 rounded text-scada-text hover:bg-scada-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {button.icon}
          </button>
        )
      })}
    </div>
  )
}
