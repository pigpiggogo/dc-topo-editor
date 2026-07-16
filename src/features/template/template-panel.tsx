import type { ReactElement } from 'react'
import { useState, useCallback } from 'react'
import {
  LayoutTemplate,
  Zap,
  Server,
  Plug,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { getAllTemplates } from './template-registry'
import { applyTemplate } from './template-loader'

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  microgrid: Zap,
  data_center: Server,
  transport: Plug,
}

export function TemplatePanel(): ReactElement {
  const [expanded, setExpanded] = useState(true)

  const handleLoadTemplate = useCallback((templateId: string) => {
    const templates = getAllTemplates()
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    applyTemplate(template, { clearExisting: true })
  }, [])

  const templates = getAllTemplates()

  return (
    <div className="flex flex-col h-full bg-scada-panel">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 border-b border-scada-border bg-scada-bg hover:bg-scada-border/30 transition-colors"
      >
        <LayoutTemplate className="w-4 h-4 text-scada-text-muted" />
        <span className="text-sm font-medium text-scada-text">模板库</span>
        <span className="ml-auto text-xs text-scada-text-muted">{templates.length}</span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-scada-text-muted" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-scada-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {templates.length === 0 ? (
            <div className="text-xs text-scada-text-muted text-center py-4">暂无可用模板</div>
          ) : (
            templates.map((template) => {
              const IconComponent = CATEGORY_ICON_MAP[template.category] ?? Zap
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleLoadTemplate(template.id)}
                  className="w-full text-left rounded border border-scada-border bg-scada-bg hover:bg-scada-border/30 transition-colors p-2 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4 text-scada-text-muted group-hover:text-scada-text" />
                    <span className="text-xs font-medium text-scada-text group-hover:text-white">
                      {template.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-scada-text-muted overflow-hidden text-ellipsis">
                    {template.description}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1 py-0.5 rounded bg-scada-panel text-scada-text-muted border border-scada-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
