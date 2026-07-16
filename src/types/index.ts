// Core type definitions for DC Topology Editor

// ============================================================================
// 基础几何类型
// ============================================================================

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Position, Size {}

export interface Vector2 {
  x: number
  y: number
}

// ============================================================================
// 设备分类
// ============================================================================

export type DeviceCategory = 'power' | 'converter' | 'distribution' | 'load' | 'auxiliary'

export type DeviceType =
  | 'pv_panel'
  | 'battery'
  | 'sscb'
  | 'dcdc_converter'
  | 'dc_bus'
  | 'load'
  | 'rectifier'
  | 'inverter'
  | 'charger'
  | 'meter'
  | 'grid'
  | 'sst'
  | 'acdc_converter'

// ============================================================================
// 端口定义
// ============================================================================

export type PortType = 'input' | 'output' | 'bidirectional'

export type PortPosition = 'left' | 'right' | 'top' | 'bottom'

export interface PortDefinition {
  id: string
  type: PortType
  position: PortPosition
  offsetX?: number
  offsetY?: number
  maxConnections?: number
}

// ============================================================================
// 设备节点数据
// ============================================================================

export interface DeviceNodeData {
  name: string
  deviceType: string
  category: DeviceCategory
  ratedVoltage: number
  ratedCurrent: number
  ratedPower: number
  params: Record<string, unknown>
  ports: PortDefinition[]
}

// ============================================================================
// 连线定义
// ============================================================================

export type EdgeStyle = 'straight' | 'orthogonal' | 'bezier'

export type EdgeType = 'dc_power' | 'ac_power' | 'control' | 'communication'

export interface TopologyEdgeData {
  label?: string
  voltage?: number
  cableSpec?: string
  switchStatus?: 'open' | 'closed'
  style: EdgeStyle
}

// ============================================================================
// 视口状态
// ============================================================================

export interface ViewportState {
  x: number
  y: number
  zoom: number
}

// ============================================================================
// 导出选项
// ============================================================================

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf'
  resolution: 1 | 2 | 4
  background: 'white' | 'transparent' | 'grid'
  scope: 'full' | 'viewport' | 'selection'
}

// ============================================================================
// 事件映射
// ============================================================================

export interface ValidationIssue {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  nodeId?: string
  edgeId?: string
}

export type EventName =
  | 'canvas.nodeAdded'
  | 'canvas.nodeRemoved'
  | 'canvas.nodeSelected'
  | 'canvas.edgeAdded'
  | 'canvas.edgeRemoved'
  | 'canvas.viewportChanged'
  | 'device.propertyChanged'
  | 'device.validated'
  | 'command.executed'
  | 'command.undone'
  | 'command.redone'
  | 'command.stackChanged'
  | 'plugin.installed'
  | 'plugin.uninstalled'
  | 'export.requested'
  | 'export.completed'
  | 'export.failed'
  | 'ui.panelToggled'
  | 'ui.themeChanged'
  | 'topology.validated'

export interface EventPayloadMap {
  'canvas.nodeAdded': { nodeId: string; type: string; position: Position }
  'canvas.nodeRemoved': { nodeId: string }
  'canvas.nodeSelected': { nodeId: string | null }
  'canvas.edgeAdded': { edgeId: string; source: string; target: string }
  'canvas.edgeRemoved': { edgeId: string }
  'canvas.viewportChanged': { zoom: number; x: number; y: number }
  'device.propertyChanged': { nodeId: string; key: string; value: unknown }
  'device.validated': { nodeId: string; valid: boolean; errors?: string[] }
  'command.executed': { commandId: string; description: string }
  'command.undone': { commandId: string }
  'command.redone': { commandId: string }
  'command.stackChanged': { canUndo: boolean; canRedo: boolean }
  'plugin.installed': { pluginId: string }
  'plugin.uninstalled': { pluginId: string }
  'export.requested': { format: 'png' | 'jpg' | 'svg' | 'pdf' }
  'export.completed': { format: string; data: string | Blob }
  'export.failed': { format: string; error: string }
  'ui.panelToggled': { panel: 'left' | 'right'; open: boolean }
  'ui.themeChanged': { theme: 'light' | 'dark' | 'system' }
  'topology.validated': { issues: ValidationIssue[] }
}

export type EventPayload<T extends EventName> = EventPayloadMap[T]

// ============================================================================
// 命令状态
// ============================================================================

export type CommandStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'undone' | 'redone'

// ============================================================================
// 设备分类元数据
// ============================================================================

export interface DeviceCategoryMeta {
  id: DeviceCategory
  name: string
  description: string
  color: string
  icon: string
}

// ============================================================================
// 插件接口
// ============================================================================

import type { ComponentType } from 'react'

export interface IDevicePlugin {
  readonly id: string
  readonly name: string
  readonly category: DeviceCategory
  readonly icon: ComponentType
  nodeComponent: ComponentType<Record<string, unknown>>
  propertySchema: unknown
  defaultData(): Record<string, unknown>
  getPorts(): PortDefinition[]
  validate(data: unknown): boolean
  onInstall(registry: unknown): void
}

// ============================================================================
// 注册表接口
// ============================================================================

export interface IRegistry<T> {
  register(key: string, item: T): void
  unregister(key: string): void
  get(key: string): T | undefined
  getAll(): T[]
  has(key: string): boolean
  filter(predicate: (item: T) => boolean): T[]
}

// ============================================================================
// 命令接口
// ============================================================================

export interface ICommand {
  readonly id: string
  readonly timestamp: number
  execute(): void
  undo(): void
  redo(): void
  getDescription(): string
}

// ============================================================================
// 模板接口
// ============================================================================

export interface TopologyTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: Array<{
    id: string
    type: string
    position: Position
    data: DeviceNodeData
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    data: TopologyEdgeData
  }>
}

// ============================================================================
// 图层接口
// ============================================================================

export type LayerType = 'background' | 'device' | 'annotation'

export interface Layer {
  id: LayerType
  name: string
  zIndex: number
  visible: boolean
  locked: boolean
}
