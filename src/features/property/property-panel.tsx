import { useState, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { ReactElement } from 'react'
import { ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { useBoundStore } from '@/store'
import { pluginManager } from '@/engine/plugin-instance'
import type { SchemaDefinition, GroupDefinition, FieldDefinition } from '@/core/schema/types'
import { busbarPropertySchema } from '@/edges/busbar-property-schema'
import { PropertyField } from './property-field'

type PropertyPanelProps = {
  className?: string
}

function getEdgeSchema(edgeType: string | undefined): SchemaDefinition | undefined {
  if (edgeType === 'busbar') return busbarPropertySchema
  return undefined
}

export function PropertyPanel({ className }: PropertyPanelProps): ReactElement {
  const selectedNodes = useBoundStore(useShallow((state) => state.getSelectedNodes()))
  const node = selectedNodes.length > 0 ? selectedNodes[0] : undefined
  const selectedEdge = useBoundStore((state) => state.edges.find((e) => e.selected))
  const deviceData = useBoundStore((state) => (node ? state.getDeviceData(node.id) : undefined))

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }, [])

  const handleUpdateNode = (key: string, value: unknown) => {
    if (!node) return
    const store = useBoundStore.getState()
    store.updateDeviceProperty(node.id, key, value)
    store.setNodes((nodes) =>
      nodes.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, [key]: value } } : n)),
    )
  }

  const handleUpdateEdge = (key: string, value: unknown) => {
    if (!selectedEdge) return
    useBoundStore.getState().setEdges((edges) =>
      edges.map((e) =>
        e.id === selectedEdge.id
          ? { ...e, data: { ...((e.data as Record<string, unknown>) ?? {}), [key]: value } }
          : e,
      ),
    )
  }

  if (!node && !selectedEdge) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full p-4 text-xs text-slate-400 bg-slate-900 border-l border-slate-700 ${className ?? ''}`}
      >
        <Settings className="w-8 h-8 mb-2 text-slate-600" />
        <p>选中设备或连线后，属性将在此显示</p>
      </div>
    )
  }

  if (node) {
    const deviceType = node.type ?? ''
    const plugin = pluginManager.getPlugin(deviceType)
    const rawSchema = plugin?.propertySchema

    const schema: SchemaDefinition | undefined =
      rawSchema &&
      typeof rawSchema === 'object' &&
      Array.isArray((rawSchema as Record<string, unknown>).fields) &&
      Array.isArray((rawSchema as Record<string, unknown>).groups)
        ? (rawSchema as SchemaDefinition)
        : undefined

    const title = (node.data?.name as string) ?? node.id

    return (
      <SchemaPanel
        className={className}
        title={title}
        schema={schema}
        data={deviceData}
        collapsedGroups={collapsedGroups}
        onToggleGroup={toggleGroup}
        onUpdate={handleUpdateNode}
        emptyText="该设备无属性配置"
      />
    )
  }

  const edgeType = selectedEdge?.type ?? ''
  const schema = getEdgeSchema(edgeType)
  const edgeData = (selectedEdge?.data as Record<string, unknown> | undefined) ?? {}
  const title = edgeType === 'busbar' ? '直流母线' : `连线 (${selectedEdge?.id})`

  return (
    <SchemaPanel
      className={className}
      title={title}
      schema={schema}
      data={edgeData}
      collapsedGroups={collapsedGroups}
      onToggleGroup={toggleGroup}
      onUpdate={handleUpdateEdge}
      emptyText="该连线暂无属性配置"
    />
  )
}

type SchemaPanelProps = {
  className?: string
  title: string
  schema: SchemaDefinition | undefined
  data: Record<string, unknown> | undefined
  collapsedGroups: Set<string>
  onToggleGroup: (key: string) => void
  onUpdate: (key: string, value: unknown) => void
  emptyText: string
}

function SchemaPanel({
  className,
  title,
  schema,
  data,
  collapsedGroups,
  onToggleGroup,
  onUpdate,
  emptyText,
}: SchemaPanelProps): ReactElement {
  const groupedFieldKeys = new Set<string>()
  for (const group of schema?.groups ?? []) {
    if (!group || !Array.isArray(group.fields)) continue
    for (const field of group.fields) {
      if (field && field.key) groupedFieldKeys.add(field.key)
    }
  }

  const ungroupedFields =
    schema?.fields?.filter((f) => f && f.key && !groupedFieldKeys.has(f.key)) ?? []

  const validGroups =
    schema?.groups?.filter((g): g is GroupDefinition & { fields: FieldDefinition[] } => {
      return !!g && Array.isArray(g.fields)
    }) ?? []

  return (
    <div
      className={`flex flex-col h-full bg-slate-900 border-l border-slate-700 text-slate-200 text-xs ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800">
        <Settings className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-100">属性</span>
        <span className="ml-auto text-slate-500 truncate max-w-[140px]">{title}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {ungroupedFields.length > 0 && (
          <div className="space-y-2">
            {ungroupedFields.map((field) => (
              <PropertyField
                key={field.key}
                field={field}
                value={data?.[field.key] ?? field.defaultValue}
                onChange={(value) => onUpdate(field.key, value)}
              />
            ))}
          </div>
        )}

        {validGroups.map((group) => (
          <GroupSection
            key={group.key || group.label}
            group={group}
            data={data}
            collapsed={collapsedGroups.has(group.key)}
            onToggle={() => onToggleGroup(group.key)}
            onUpdate={onUpdate}
          />
        ))}

        {ungroupedFields.length === 0 && validGroups.length === 0 && (
          <div className="text-center text-slate-500 py-4">{emptyText}</div>
        )}
      </div>
    </div>
  )
}

type GroupSectionProps = {
  group: GroupDefinition
  data: Record<string, unknown> | undefined
  collapsed: boolean
  onToggle: () => void
  onUpdate: (key: string, value: unknown) => void
}

function GroupSection({ group, data, collapsed, onToggle, onUpdate }: GroupSectionProps): ReactElement {
  const fields = Array.isArray(group.fields) ? group.fields : []

  return (
    <div className="border border-slate-700 rounded overflow-hidden">
      <button
        type="button"
        className="flex items-center w-full px-2 py-1.5 text-left bg-slate-800 hover:bg-slate-700 text-slate-200"
        onClick={onToggle}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 mr-1 shrink-0" />
        ) : (
          <ChevronDown className="w-3 h-3 mr-1 shrink-0" />
        )}
        <span className="font-medium">{group.label}</span>
      </button>
      {!collapsed && (
        <div className="p-2 space-y-2 bg-slate-900">
          {fields.map((field) => (
            <PropertyField
              key={field.key}
              field={field}
              value={data?.[field.key] ?? field.defaultValue}
              onChange={(value) => onUpdate(field.key, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
