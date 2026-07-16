import { toCanvas } from 'html-to-image'
import type { ExportOptions } from '@/types'

export interface ImageExportResult {
  blob: Blob
  dataUrl: string
  width: number
  height: number
}

function getBackgroundColor(background: ExportOptions['background']): string | null {
  switch (background) {
    case 'transparent':
      return null
    case 'white':
      return '#ffffff'
    case 'grid':
      return '#0f172a'
    default:
      return '#0f172a'
  }
}

function calculateBounds(
  scope: ExportOptions['scope'],
  viewport: HTMLElement,
): { x: number; y: number; width: number; height: number } | null {
  if (scope === 'viewport') {
    return null
  }

  const selector = scope === 'selection' ? '.react-flow__node.selected' : '.react-flow__node'
  const nodeElements = document.querySelectorAll(selector)
  if (nodeElements.length === 0) {
    return null
  }

  const viewportRect = viewport.getBoundingClientRect()
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodeElements.forEach((node) => {
    const rect = node.getBoundingClientRect()
    const relativeX = rect.left - viewportRect.left
    const relativeY = rect.top - viewportRect.top
    minX = Math.min(minX, relativeX)
    minY = Math.min(minY, relativeY)
    maxX = Math.max(maxX, relativeX + rect.width)
    maxY = Math.max(maxY, relativeY + rect.height)
  })

  const padding = 40
  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error('Canvas toBlob returned null'))
          return
        }
        resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

export async function exportImage(options: ExportOptions): Promise<ImageExportResult> {
  const container = document.querySelector('.react-flow') as HTMLElement | null
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null
  if (!container || !viewport) {
    throw new Error('Canvas container not found')
  }

  const isJpg = options.format === 'jpg'
  let backgroundColor = getBackgroundColor(options.background)
  if (isJpg && backgroundColor === null) {
    backgroundColor = '#ffffff'
  }

  const scope = options.scope
  const cropBounds = calculateBounds(scope, viewport)
  const target = cropBounds === null ? container : viewport
  const pixelRatio = options.resolution

  const fullCanvas = await toCanvas(target, {
    pixelRatio,
    backgroundColor: backgroundColor ?? undefined,
    filter: (node) => !node.classList?.contains('export-ignore'),
  })

  const mimeType = isJpg ? 'image/jpeg' : 'image/png'
  const quality = isJpg ? 0.92 : undefined

  let finalCanvas = fullCanvas
  if (cropBounds !== null) {
    const sourceX = cropBounds.x * pixelRatio
    const sourceY = cropBounds.y * pixelRatio
    const sourceWidth = cropBounds.width * pixelRatio
    const sourceHeight = cropBounds.height * pixelRatio

    finalCanvas = document.createElement('canvas')
    finalCanvas.width = sourceWidth
    finalCanvas.height = sourceHeight
    const ctx = finalCanvas.getContext('2d')
    if (ctx === null) {
      throw new Error('Could not get canvas context')
    }
    ctx.drawImage(fullCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight)
  }

  const dataUrl = finalCanvas.toDataURL(mimeType, quality)
  const blob = await canvasToBlob(finalCanvas, mimeType, quality)

  return {
    blob,
    dataUrl,
    width: finalCanvas.width / pixelRatio,
    height: finalCanvas.height / pixelRatio,
  }
}
