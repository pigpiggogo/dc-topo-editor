import type { ReactElement } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
}

export function ToolbarButton({
  label,
  active,
  className = '',
  ...props
}: ToolbarButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={`px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-50 ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-scada-border hover:bg-scada-text-muted text-scada-text'
      } ${className}`}
      {...props}
    >
      {label}
    </button>
  )
}
