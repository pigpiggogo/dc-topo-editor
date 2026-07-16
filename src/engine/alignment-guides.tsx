import type { ReactElement } from 'react'

export interface AlignmentGuide {
  orientation: 'vertical' | 'horizontal'
  position: number
}

interface AlignmentGuidesProps {
  guides: AlignmentGuide[]
}

const GUIDE_LENGTH = 100000

export function AlignmentGuides({ guides }: AlignmentGuidesProps): ReactElement | null {
  if (guides.length === 0) {
    return null
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      {guides.map((guide, index) => {
        if (guide.orientation === 'vertical') {
          return (
            <line
              key={`v-${guide.position}-${index}`}
              x1={guide.position}
              y1={-GUIDE_LENGTH}
              x2={guide.position}
              y2={GUIDE_LENGTH}
              stroke="#3b82f6"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )
        }

        return (
          <line
            key={`h-${guide.position}-${index}`}
            x1={-GUIDE_LENGTH}
            y1={guide.position}
            x2={GUIDE_LENGTH}
            y2={guide.position}
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )
      })}
    </svg>
  )
}
