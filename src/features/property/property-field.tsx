import type { ReactElement } from 'react'
import type { FieldDefinition } from '@/core/schema/types'

type PropertyFieldProps = {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
}

export function PropertyField({ field, value, onChange }: PropertyFieldProps): ReactElement {
  const { ui, label, key } = field
  const widget = ui.widget

  const inputClass =
    'w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-slate-500'

  const renderInput = (): ReactElement => {
    switch (widget) {
      case 'text':
        return (
          <input
            type="text"
            id={key}
            value={String(value ?? '')}
            placeholder={ui.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        )
      case 'number':
        return (
          <div className="flex items-center gap-1">
            <input
              type="number"
              id={key}
              value={Number(value ?? 0)}
              min={ui.min}
              max={ui.max}
              step={ui.step}
              placeholder={ui.placeholder}
              onChange={(e) => {
                const num = e.target.value === '' ? 0 : Number(e.target.value)
                onChange(num)
              }}
              className={inputClass}
            />
            {ui.unit && <span className="text-xs text-slate-500 shrink-0">{ui.unit}</span>}
          </div>
        )
      case 'select':
        return (
          <select
            id={key}
            value={String(value ?? '')}
            onChange={(e) => {
              const selected = ui.options?.find((o) => String(o.value) === e.target.value)
              onChange(selected?.value ?? e.target.value)
            }}
            className={inputClass}
          >
            {ui.options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case 'switch':
        return (
          <label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={key}
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-slate-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-400">{value ? '开启' : '关闭'}</span>
          </label>
        )
      case 'textarea':
        return (
          <textarea
            id={key}
            value={String(value ?? '')}
            rows={ui.rows ?? 3}
            placeholder={ui.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        )
      default:
        return (
          <input
            type="text"
            id={key}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        )
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={key} className="text-xs font-medium text-slate-400">
        {label}
      </label>
      {renderInput()}
    </div>
  )
}
