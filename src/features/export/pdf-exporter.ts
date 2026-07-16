import { jsPDF } from 'jspdf'
import type { ExportOptions } from '@/types'
import { exportImage } from './image-exporter'

export interface PDFExportResult {
  blob: Blob
  dataUrl: string
}

export async function exportPDF(options: ExportOptions): Promise<PDFExportResult> {
  const imageOptions: ExportOptions = { ...options, format: 'png' }
  const { dataUrl, width, height } = await exportImage(imageOptions)

  const aspectRatio = width / height
  const pageWidth = 210
  const pageHeight = 297
  const margin = 10

  const pdf = new jsPDF({
    orientation: aspectRatio > pageWidth / pageHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const availableWidth = pageWidth - margin * 2
  const availableHeight = pageHeight - margin * 3
  let imgWidth = availableWidth
  let imgHeight = imgWidth / aspectRatio

  if (imgHeight > availableHeight) {
    imgHeight = availableHeight
    imgWidth = imgHeight * aspectRatio
  }

  const x = (pageWidth - imgWidth) / 2
  const y = margin * 2

  pdf.setFontSize(10)
  pdf.setTextColor(40, 40, 40)
  pdf.text('直流拓扑图', margin, margin)

  pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight)

  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)
  const dateStr = new Date().toLocaleString('zh-CN')
  pdf.text(`DC Topo Editor v1.0 | ${dateStr}`, margin, pageHeight - margin)

  const blob = pdf.output('blob')
  const pdfDataUrl = pdf.output('datauristring')

  return { blob, dataUrl: pdfDataUrl }
}
