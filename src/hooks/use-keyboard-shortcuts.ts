import { useEffect, useCallback, useRef } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { globalCommandBus } from '@/engine/command-bus-instance'
import { CopyPasteCommand } from '@/commands/copy-paste-command.ts'
import { useBoundStore } from '@/store'

const PASTE_OFFSET_STEP = 20

function isInputFocused(): boolean {
  const activeElement = document.activeElement
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    (activeElement instanceof HTMLElement && activeElement.isContentEditable)
  )
}

function createCopyPayload(nodes: Node[], edges: Edge[]) {
  const nodeIdSet = new Set(nodes.map((n) => n.id))
  const store = useBoundStore.getState()

  const deviceData = new Map<string, Record<string, unknown>>()
  for (const node of nodes) {
    const data = store.getDeviceData(node.id)
    if (data !== undefined) {
      deviceData.set(node.id, data)
    }
  }

  const internalEdges = edges.filter(
    (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target),
  )

  return {
    nodes,
    edges: internalEdges,
    deviceData,
  }
}

export function useKeyboardShortcuts(): void {
  const nodes = useBoundStore((state) => state.nodes)
  const edges = useBoundStore((state) => state.edges)
  const selectNode = useBoundStore((state) => state.selectNode)

  const clipboardRef = useRef<ReturnType<typeof createCopyPayload> | null>(null)
  const pasteCountRef = useRef(0)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isCtrl = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      // Ctrl+Z — Undo
      if (isCtrl && key === 'z' && !event.shiftKey) {
        event.preventDefault()
        globalCommandBus.undo()
        return
      }

      // Ctrl+Y or Ctrl+Shift+Z — Redo
      if ((isCtrl && key === 'y') || (isCtrl && event.shiftKey && key === 'z')) {
        event.preventDefault()
        globalCommandBus.redo()
        return
      }

      // Ctrl+A — Select all / deselect
      if (isCtrl && key === 'a') {
        event.preventDefault()
        if (isInputFocused()) {
          return
        }

        const allNodeIds = nodes.map((n) => n.id)
        if (allNodeIds.length > 0) {
          const allSelected = nodes.every((n) => n.selected)
          if (allSelected) {
            selectNode(null)
          } else {
            selectNode(allNodeIds[0] ?? null)
          }
        }
        return
      }

      // Ctrl+C — Copy selected nodes and their internal edges
      if (isCtrl && key === 'c') {
        event.preventDefault()
        if (isInputFocused()) {
          return
        }

        const selectedNodes = nodes.filter((n) => n.selected)
        if (selectedNodes.length === 0) {
          clipboardRef.current = null
          return
        }

        clipboardRef.current = createCopyPayload(selectedNodes, edges)
        pasteCountRef.current = 0
        return
      }

      // Ctrl+V — Paste
      if (isCtrl && key === 'v') {
        event.preventDefault()
        if (isInputFocused()) {
          return
        }

        const payload = clipboardRef.current
        if (payload === null || payload.nodes.length === 0) {
          return
        }

        pasteCountRef.current += 1
        const offset = PASTE_OFFSET_STEP * pasteCountRef.current
        const command = new CopyPasteCommand(payload, { x: offset, y: offset })
        globalCommandBus.execute(command)
        return
      }

      // Ctrl+S — Save (trigger event)
      if (isCtrl && key === 's') {
        event.preventDefault()
        // Phase 6 will implement actual save
        return
      }
    },
    [nodes, edges, selectNode],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
