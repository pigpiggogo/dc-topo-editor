import { useState } from 'react'
import type { ReactElement } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Play,
  ChevronRight,
} from 'lucide-react'
import { useBoundStore } from '@/store'
import type { ValidationIssue } from '@/types'
import { topologyValidator } from './topology-validator'

export function ValidationPanel(): ReactElement {
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)

  const runAnalysis = (): void => {
    setIsAnalyzing(true)
    const state = useBoundStore.getState()
    const result = topologyValidator.validate(state.nodes, state.edges, state.deviceData)
    setIssues(result)
    setLastAnalyzed(new Date())
    setIsAnalyzing(false)
  }

  const handleIssueClick = (issue: ValidationIssue): void => {
    if (issue.edgeId) {
      useBoundStore.getState().setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: false })),
      )
      useBoundStore.getState().setEdges((eds) =>
        eds.map((e) => ({ ...e, selected: e.id === issue.edgeId })),
      )
    } else if (issue.nodeId) {
      useBoundStore.getState().selectNode(issue.nodeId)
      useBoundStore.getState().setEdges((eds) =>
        eds.map((e) => ({ ...e, selected: false })),
      )
    }
  }

  const errorCount = issues.filter((i) => i.type === 'error').length
  const warningCount = issues.filter((i) => i.type === 'warning').length
  const infoCount = issues.filter((i) => i.type === 'info').length

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 text-slate-200 text-xs">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800">
        <CheckCircle className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-100">分析总结</span>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white text-xs transition-colors"
        >
          <Play className="w-3 h-3" />
          {isAnalyzing ? '分析中...' : '生成总结'}
        </button>
      </div>

      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-slate-700 bg-slate-800/50">
        <span className="flex items-center gap-1 text-red-400">
          <AlertCircle className="w-3 h-3" />
          {errorCount}
        </span>
        <span className="flex items-center gap-1 text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          {warningCount}
        </span>
        <span className="flex items-center gap-1 text-blue-400">
          <Info className="w-3 h-3" />
          {infoCount}
        </span>
        {lastAnalyzed && (
          <span className="ml-auto text-slate-500 text-[10px]">
            {lastAnalyzed.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-slate-400">
            <CheckCircle className="w-8 h-8 mb-2 text-slate-600" />
            <p>{lastAnalyzed ? '暂无分析结果' : '点击生成总结开始分析'}</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {issues.map((issue) => (
              <IssueItem
                key={issue.id}
                issue={issue}
                onClick={() => handleIssueClick(issue)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function IssueItem({
  issue,
  onClick,
}: {
  issue: ValidationIssue
  onClick: () => void
}): ReactElement {
  const icon =
    issue.type === 'error' ? (
      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
    ) : issue.type === 'warning' ? (
      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
    ) : (
      <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
    )

  const bgColor =
    issue.type === 'error'
      ? 'bg-red-900/20 hover:bg-red-900/30'
      : issue.type === 'warning'
        ? 'bg-yellow-900/20 hover:bg-yellow-900/30'
        : 'bg-blue-900/20 hover:bg-blue-900/30'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${bgColor}`}
    >
      {icon}
      <span className="flex-1 text-slate-200 leading-tight">{issue.message}</span>
      <ChevronRight className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
    </button>
  )
}
