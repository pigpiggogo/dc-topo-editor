import { useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import { X, Download, FileImage, FileText } from 'lucide-react'
import type { ExportOptions } from '@/types'
import { EXPORT_RESOLUTIONS } from '@/constants'
import { exportImage } from './image-exporter'
import { exportPDF } from './pdf-exporter'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
}

type ExportFormat = 'png' | 'jpg' | 'pdf'

export function ExportDialog({ open, onClose }: ExportDialogProps): ReactElement | null {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [resolution, setResolution] = useState<1 | 2 | 4>(2)
  const [background, setBackground] = useState<ExportOptions['background']>('grid')
  const [scope, setScope] = useState<ExportOptions['scope']>('viewport')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    setExporting(true)
    setError(null)
    try {
      const options: ExportOptions = {
        format: format === 'pdf' ? 'pdf' : format,
        resolution,
        background,
        scope,
      }

      if (format === 'pdf') {
        const result = await exportPDF(options)
        downloadBlob(result.blob, `topology-${timestamp()}.pdf`)
      } else {
        const result = await exportImage(options)
        const ext = format
        downloadBlob(result.blob, `topology-${timestamp()}.${ext}`)
      }

      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      console.error('Export failed:', message)
      setError(message)
    } finally {
      setExporting(false)
    }
  }, [format, resolution, background, scope, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-scada-panel border border-scada-border rounded-lg shadow-xl w-96 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-scada-border">
          <h2 className="text-sm font-semibold text-scada-text">导出拓扑图</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-scada-text-muted hover:text-scada-text transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-scada-text-muted">格式</label>
            <div className="grid grid-cols-3 gap-2">
              <FormatButton
                active={format === 'png'}
                onClick={() => setFormat('png')}
                icon={<FileImage className="w-4 h-4" />}
                label="PNG"
              />
              <FormatButton
                active={format === 'jpg'}
                onClick={() => setFormat('jpg')}
                icon={<FileImage className="w-4 h-4" />}
                label="JPG"
              />
              <FormatButton
                active={format === 'pdf'}
                onClick={() => setFormat('pdf')}
                icon={<FileText className="w-4 h-4" />}
                label="PDF"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-scada-text-muted">分辨率</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value) as 1 | 2 | 4)}
              className="w-full px-2 py-1.5 text-xs bg-scada-bg border border-scada-border rounded text-scada-text focus:outline-none focus:border-blue-500"
            >
              {EXPORT_RESOLUTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-scada-text-muted">背景</label>
            <div className="grid grid-cols-3 gap-2">
              <BackgroundButton
                active={background === 'grid'}
                onClick={() => setBackground('grid')}
                label="网格"
              />
              <BackgroundButton
                active={background === 'white'}
                onClick={() => setBackground('white')}
                label="白色"
              />
              <BackgroundButton
                active={background === 'transparent'}
                onClick={() => setBackground('transparent')}
                label="透明"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-scada-text-muted">范围</label>
            <div className="grid grid-cols-3 gap-2">
              <ScopeButton
                active={scope === 'viewport'}
                onClick={() => setScope('viewport')}
                label="当前视口"
              />
              <ScopeButton
                active={scope === 'full'}
                onClick={() => setScope('full')}
                label="完整画布"
              />
              <ScopeButton
                active={scope === 'selection'}
                onClick={() => setScope('selection')}
                label="选中区域"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-scada-border">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded border border-scada-border text-scada-text hover:bg-scada-border/30 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-800/50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? '导出中...' : '导出'}
          </button>
        </div>
        {error !== null && (
          <div className="px-4 pb-3 text-xs text-red-400">导出失败：{error}</div>
        )}
      </div>
    </div>
  )
}

function FormatButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactElement
  label: string
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 rounded border text-xs transition-colors ${
        active
          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
          : 'bg-scada-bg border-scada-border text-scada-text-muted hover:text-scada-text hover:border-scada-text-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function BackgroundButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-1.5 rounded border text-xs transition-colors ${
        active
          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
          : 'bg-scada-bg border-scada-border text-scada-text-muted hover:text-scada-text hover:border-scada-text-muted'
      }`}
    >
      {label}
    </button>
  )
}

function ScopeButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-1.5 rounded border text-xs transition-colors ${
        active
          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
          : 'bg-scada-bg border-scada-border text-scada-text-muted hover:text-scada-text hover:border-scada-text-muted'
      }`}
    >
      {label}
    </button>
  )
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function timestamp(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `${y}${m}${d}_${h}${min}${s}`
}
