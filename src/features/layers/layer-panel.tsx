import type { ReactElement } from 'react'
import { Eye, EyeOff, Lock, Unlock, Layers } from 'lucide-react'
import { useBoundStore } from '@/store'
import { LAYERS } from '@/constants'

export function LayerPanel(): ReactElement {
  const layerStates = useBoundStore((state) => state.layerStates)
  const toggleLayerVisible = useBoundStore((state) => state.toggleLayerVisible)
  const toggleLayerLocked = useBoundStore((state) => state.toggleLayerLocked)

  return (
    <div className="flex flex-col h-full bg-scada-panel">
      <div className="p-2 border-b border-scada-border flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-scada-text-muted" />
        <span className="font-medium text-xs text-scada-text">图层管理</span>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {LAYERS.map((layer) => {
          const state = layerStates[layer.id]
          return (
            <div
              key={layer.id}
              className="flex items-center justify-between px-2 py-1 rounded hover:bg-scada-border/20"
            >
              <span className="text-xs text-scada-text">{layer.name}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleLayerVisible(layer.id)}
                  className="p-1 rounded hover:bg-scada-border/30 text-scada-text-muted transition-colors"
                  title={state.visible ? '隐藏图层' : '显示图层'}
                >
                  {state.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleLayerLocked(layer.id)}
                  className="p-1 rounded hover:bg-scada-border/30 text-scada-text-muted transition-colors"
                  title={state.locked ? '解锁图层' : '锁定图层'}
                >
                  {state.locked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
