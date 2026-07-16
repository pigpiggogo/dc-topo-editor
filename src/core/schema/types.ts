import type { ZodTypeAny, ZodObject } from 'zod'

export type FieldType = 'text' | 'number' | 'select' | 'switch' | 'textarea' | 'group'

export interface UIMetadata {
  widget: string
  unit?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: string | number | boolean }>
  placeholder?: string
  rows?: number
  colSpan?: number
}

export interface Condition {
  dependsOn: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in'
  value: unknown
}

export interface FieldDefinition {
  type: FieldType
  key: string
  label: string
  zodSchema: ZodTypeAny
  ui: UIMetadata
  defaultValue: unknown
  condition?: Condition
}

export interface GroupDefinition {
  key: string
  label: string
  fields: FieldDefinition[]
  condition?: Condition
  collapsed?: boolean
}

export interface SchemaDefinition {
  fields: FieldDefinition[]
  groups: GroupDefinition[]
  zodSchema: ZodObject<Record<string, ZodTypeAny>>
  defaultValues: Record<string, unknown>
}

export interface SchemaRegistry {
  register(deviceType: string, schema: SchemaDefinition): void
  unregister(deviceType: string): void
  getSchema(deviceType: string): SchemaDefinition | undefined
  getAllSchemas(): SchemaDefinition[]
  hasSchema(deviceType: string): boolean
}
