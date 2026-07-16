import { createRegistry } from '@/core/registry/registry'
import type { TemplateDefinition } from './template-types'

export const templateRegistry = createRegistry<TemplateDefinition>()

export function registerTemplate(template: TemplateDefinition): void {
  templateRegistry.register(template.id, template)
}

export function unregisterTemplate(id: string): void {
  templateRegistry.unregister(id)
}

export function getTemplate(id: string): TemplateDefinition | undefined {
  return templateRegistry.get(id)
}

export function getAllTemplates(): TemplateDefinition[] {
  return templateRegistry.getAll()
}

export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  return templateRegistry.filter((t) => t.category === category)
}

export function getTemplatesByTag(tag: string): TemplateDefinition[] {
  return templateRegistry.filter((t) => t.tags.includes(tag))
}
