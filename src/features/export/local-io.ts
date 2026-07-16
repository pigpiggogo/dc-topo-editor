import {
  serializeTopology,
  deserializeTopology,
  convertToStoreState,
  type TopologyState,
  type SerializedTopology,
} from './json-serializer'
import { AUTO_SAVE_INTERVAL, FILE_EXTENSION } from '@/constants'

const LOCAL_STORAGE_KEY = 'dc-topo-editor:auto-save'

let autoSaveTimer: ReturnType<typeof setInterval> | null = null

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function saveTopology(state: TopologyState, filename?: string): void {
  const json = serializeTopology(state)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const name = filename ?? `topology-${timestamp}${FILE_EXTENSION}`
  downloadFile(json, name)
}

export function loadTopology(file: File): Promise<TopologyState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event): void => {
      const content = event.target?.result
      if (typeof content !== 'string') {
        reject(new Error('Failed to read file content'))
        return
      }

      const result = deserializeTopology(content)
      if (!result.success || result.data === undefined) {
        reject(new Error(result.error ?? 'Unknown deserialization error'))
        return
      }

      const storeState = convertToStoreState(result.data)
      resolve(storeState)
    }

    reader.onerror = (): void => {
      reject(new Error('File read error'))
    }

    reader.readAsText(file)
  })
}

export function startAutoSave(getState: () => TopologyState, interval = AUTO_SAVE_INTERVAL): void {
  stopAutoSave()
  autoSaveTimer = setInterval(() => {
    const state = getState()
    const json = serializeTopology(state)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, json)
    } catch (error) {
      console.error(
        'Auto-save failed:',
        error instanceof Error ? error.message : String(error),
      )
    }
  }, interval)
}

export function stopAutoSave(): void {
  if (autoSaveTimer !== null) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

export function checkAutoSave(): TopologyState | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved === null) return null

    const result = deserializeTopology(saved)
    if (!result.success || result.data === undefined) return null

    return convertToStoreState(result.data)
  } catch {
    return null
  }
}

export function clearAutoSave(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch {
    // Ignore localStorage errors
  }
}

export interface AutoSaveStatus {
  hasData: boolean
  timestamp: string | null
}

export function getAutoSaveStatus(): AutoSaveStatus {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved === null) {
      return { hasData: false, timestamp: null }
    }

    const result = deserializeTopology(saved)
    if (!result.success || result.data === undefined) {
      return { hasData: false, timestamp: null }
    }

    return { hasData: true, timestamp: result.data.createdAt }
  } catch {
    return { hasData: false, timestamp: null }
  }
}

export function createFileInput(
  onFileSelected: (file: File) => void,
): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = `${FILE_EXTENSION},.json,application/json`
  input.style.display = 'none'

  input.onchange = (event): void => {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (files !== null && files.length > 0) {
      onFileSelected(files[0])
    }
    document.body.removeChild(input)
  }

  document.body.appendChild(input)
  input.click()

  return input
}

export function exportToJSON(state: TopologyState): string {
  return serializeTopology(state)
}

export function importFromJSON(jsonString: string): SerializedTopology | null {
  const result = deserializeTopology(jsonString)
  return result.success ? result.data ?? null : null
}
