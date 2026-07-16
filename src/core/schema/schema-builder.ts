import { z } from 'zod'
import type { FieldDefinition, GroupDefinition, SchemaDefinition } from './types'

export interface SchemaBuilder {
  addField(key: string, field: FieldDefinition): SchemaBuilder
  addGroup(group: GroupDefinition): SchemaBuilder
  build(): SchemaDefinition
}

export function createSchemaBuilder(): SchemaBuilder {
  const fields: FieldDefinition[] = []
  const groups: GroupDefinition[] = []

  return {
    addField(key: string, field: FieldDefinition): SchemaBuilder {
      fields.push({ ...field, key })
      return this
    },

    addGroup(groupDef: GroupDefinition): SchemaBuilder {
      const groupFields = groupDef.fields.map((f, idx) => ({
        ...f,
        key: f.key || `${groupDef.key}-field-${idx}`,
      }))
      groups.push({ ...groupDef, fields: groupFields })
      return this
    },

    build(): SchemaDefinition {
      const allFields = [...fields]
      for (const group of groups) {
        for (const field of group.fields) {
          if (!allFields.find((f) => f.key === field.key)) {
            allFields.push(field)
          }
        }
      }

      const zodShape: Record<string, z.ZodTypeAny> = {}
      const defaultValues: Record<string, unknown> = {}

      for (const field of allFields) {
        zodShape[field.key] = field.zodSchema
        defaultValues[field.key] = field.defaultValue
      }

      return {
        fields: allFields,
        groups,
        zodSchema: z.object(zodShape),
        defaultValues,
      }
    },
  }
}
