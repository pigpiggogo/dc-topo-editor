import { z } from 'zod'
import type { FieldDefinition, GroupDefinition, UIMetadata, Condition } from './types'

export interface TextFieldOptions {
  placeholder?: string
  minLength?: number
  maxLength?: number
  defaultValue?: string
  condition?: Condition
}

export function textField(
  label: string,
  options?: TextFieldOptions,
): FieldDefinition {
  let zodSchema = z.string()
  if (options?.minLength !== undefined) zodSchema = zodSchema.min(options.minLength)
  if (options?.maxLength !== undefined) zodSchema = zodSchema.max(options.maxLength)

  const ui: UIMetadata = { widget: 'text', placeholder: options?.placeholder }

  return {
    type: 'text',
    key: '',
    label,
    zodSchema,
    ui,
    defaultValue: options?.defaultValue ?? '',
    condition: options?.condition,
  }
}

export interface NumberFieldOptions {
  unit?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  condition?: Condition
  integer?: boolean
}

export function numberField(
  label: string,
  options?: NumberFieldOptions,
): FieldDefinition {
  let zodSchema = options?.integer ? z.number().int() : z.number()
  if (options?.min !== undefined) zodSchema = zodSchema.min(options.min)
  if (options?.max !== undefined) zodSchema = zodSchema.max(options.max)

  const ui: UIMetadata = {
    widget: 'number',
    unit: options?.unit,
    min: options?.min,
    max: options?.max,
    step: options?.step,
  }

  return {
    type: 'number',
    key: '',
    label,
    zodSchema,
    ui,
    defaultValue: options?.defaultValue ?? 0,
    condition: options?.condition,
  }
}

export interface SelectFieldOptions {
  options: Array<{ label: string; value: string | number | boolean }>
  defaultValue?: string | number | boolean
  condition?: Condition
}

export function selectField(
  label: string,
  options?: SelectFieldOptions,
): FieldDefinition {
  const values = options?.options.map((o) => o.value) ?? []

  // Build Zod union for select validation
  let zodSchema: z.ZodTypeAny
  if (values.length === 0) {
    zodSchema = z.string()
  } else if (values.length === 1) {
    zodSchema = z.literal(values[0])
  } else {
    const literals = values.map((v) => z.literal(v))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zodSchema = z.union(literals as [z.ZodLiteral<any>, z.ZodLiteral<any>, ...z.ZodLiteral<any>[]])
  }

  const ui: UIMetadata = {
    widget: 'select',
    options: options?.options,
  }

  return {
    type: 'select',
    key: '',
    label,
    zodSchema,
    ui,
    defaultValue: options?.defaultValue ?? (values[0] ?? ''),
    condition: options?.condition,
  }
}

export interface SwitchFieldOptions {
  defaultValue?: boolean
  condition?: Condition
}

export function switchField(
  label: string,
  options?: SwitchFieldOptions,
): FieldDefinition {
  const ui: UIMetadata = { widget: 'switch' }

  return {
    type: 'switch',
    key: '',
    label,
    zodSchema: z.boolean(),
    ui,
    defaultValue: options?.defaultValue ?? false,
    condition: options?.condition,
  }
}

export interface TextareaFieldOptions {
  placeholder?: string
  rows?: number
  defaultValue?: string
  condition?: Condition
}

export function textareaField(
  label: string,
  options?: TextareaFieldOptions,
): FieldDefinition {
  const ui: UIMetadata = {
    widget: 'textarea',
    placeholder: options?.placeholder,
    rows: options?.rows ?? 3,
  }

  return {
    type: 'textarea',
    key: '',
    label,
    zodSchema: z.string(),
    ui,
    defaultValue: options?.defaultValue ?? '',
    condition: options?.condition,
  }
}

export interface GroupFieldOptions {
  collapsed?: boolean
  condition?: Condition
}

export function group(
  label: string,
  fields: FieldDefinition[],
  options?: GroupFieldOptions,
): GroupDefinition {
  return {
    key: '',
    label,
    fields,
    collapsed: options?.collapsed ?? false,
    condition: options?.condition,
  }
}
