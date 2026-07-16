import type { ReactElement } from 'react'
import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DEVICE_CATEGORIES, DEVICE_METADATA } from '@/constants/device-metadata'
import { PaletteItem } from './palette-item'

export function PalettePanel(): ReactElement {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(DEVICE_CATEGORIES.map((cat) => cat.id)),
  )

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }, [])

  const devicesByCategory = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const cat of DEVICE_CATEGORIES) {
      map.set(cat.id, [])
    }
    for (const [deviceType, meta] of Object.entries(DEVICE_METADATA)) {
      const list = map.get(meta.category) ?? []
      list.push(deviceType)
      map.set(meta.category, list)
    }
    return map
  }, [])

  return (
    <div className="flex flex-col h-full bg-scada-panel">
      <div className="p-3 border-b border-scada-border font-medium text-sm text-scada-text">
        设备库
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {DEVICE_CATEGORIES.map((category) => {
          const devices = devicesByCategory.get(category.id) ?? []
          if (devices.length === 0) return null

          const isExpanded = expandedCategories.has(category.id)

          return (
            <div key={category.id} className="rounded border border-scada-border overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-scada-text bg-scada-bg hover:bg-scada-border/30 transition-colors"
              >
                <span className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-scada-text-muted" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-scada-text-muted" />
                  )}
                </span>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="truncate">{category.name}</span>
                <span className="ml-auto text-scada-text-muted">{devices.length}</span>
              </button>

              {isExpanded && (
                <div className="p-1 space-y-0.5 bg-scada-panel">
                  {devices.map((deviceType) => (
                    <PaletteItem key={deviceType} deviceType={deviceType} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
