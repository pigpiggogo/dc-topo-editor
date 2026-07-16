import { createSchemaBuilder } from '@/core/schema/schema-builder'
import { numberField, textField } from '@/core/schema/field-types'

export const busbarPropertySchema = createSchemaBuilder()
  .addField('voltage', numberField('电压', { unit: 'V', min: 0, defaultValue: 750 }))
  .addField('label', textField('标签', { defaultValue: '', placeholder: '可选标签' }))
  .addField('cableSpec', textField('线缆规格', { defaultValue: '', placeholder: '如 4mm²' }))
  .build()
