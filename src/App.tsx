import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { Toolbar } from '@/features/toolbar'
import { CanvasContainer } from '@/features/canvas'
import { PalettePanel } from '@/features/palette'
import { PropertyPanel } from '@/features/property'
import { StatusBar } from '@/features/status-bar'
import { AlignmentToolbar } from '@/features/alignment'
import { LayerPanel } from '@/features/layers'
import { TemplatePanel } from '@/features/template'
import { ValidationPanel } from '@/features/validation'
import { useKeyboardShortcuts, useVoltageSync } from '@/hooks'
import { useBoundStore } from '@/store'
import { globalCommandBus } from '@/engine/command-bus-instance'
import { initializeDefaultPlugins } from '@/engine'
import { startAutoSave, stopAutoSave, checkAutoSave } from '@/features/export'
import { eventBus } from '@/core/event-bus/event-bus'

function App(): ReactElement {
  useKeyboardShortcuts()
  useVoltageSync()

  const syncWithCommandBus = useBoundStore((state) => state.syncWithCommandBus)

  useEffect(() => {
    const unsubscribe = syncWithCommandBus(globalCommandBus)
    return () => { unsubscribe() }
  }, [syncWithCommandBus])

  useEffect(() => {
    initializeDefaultPlugins()
  }, [])

  useEffect(() => {
    const handler = (payload: { format: string }): void => {
      console.info(`Export requested: ${payload.format}`)
    }
    eventBus.on('export.requested', handler)
    return () => { eventBus.off('export.requested', handler) }
  }, [])

  const nodes = useBoundStore((state) => state.nodes)
  const edges = useBoundStore((state) => state.edges)
  const deviceData = useBoundStore((state) => state.deviceData)
  const viewport = useBoundStore((state) => state.viewport)
  const layerStates = useBoundStore((state) => state.layerStates)
  const theme = useBoundStore((state) => state.theme)

  useEffect(() => {
    startAutoSave(() => ({ nodes, edges, deviceData, viewport, layerStates, theme }))
    return () => { stopAutoSave() }
  }, [nodes, edges, deviceData, viewport, layerStates, theme])

  useEffect(() => {
    const saved = checkAutoSave()
    console.log('checkAutoSave result:', saved)
  }, [])

  return (
    <div className="flex h-screen w-screen bg-scada-bg text-scada-text overflow-hidden">
      {/* Left Panel */}
      <aside className="w-64 flex-shrink-0 border-r border-scada-border bg-scada-panel flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            <PalettePanel />
          </div>
          <div className="h-48 border-t border-scada-border flex-shrink-0 overflow-hidden">
            <TemplatePanel />
          </div>
        </div>
        <div className="h-40 border-t border-scada-border flex-shrink-0 flex flex-col">
          <LayerPanel />
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex-shrink-0 border-b border-scada-border bg-scada-panel flex items-center">
          <Toolbar />
        </header>
        <div className="flex-1 relative">
          <CanvasContainer />
          <AlignmentToolbar />
        </div>
        <footer className="h-7 flex-shrink-0 border-t border-scada-border bg-scada-panel flex items-center px-3">
          <StatusBar />
        </footer>
      </main>

      {/* Right Panel */}
      <aside className="w-72 flex-shrink-0 border-l border-scada-border bg-scada-panel flex flex-col">
        <div className="flex-[3] min-h-0 overflow-hidden">
          <PropertyPanel />
        </div>
        <div className="flex-[2] min-h-0 overflow-hidden border-t border-scada-border">
          <ValidationPanel />
        </div>
      </aside>
    </div>
  )
}

export default App
