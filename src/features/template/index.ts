import { registerDefaultTemplates } from './default-templates'

registerDefaultTemplates()

export {
  templateRegistry,
  registerTemplate,
  unregisterTemplate,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplatesByTag,
} from './template-registry'
export { buildTemplateData, applyTemplate, type LoadedTemplateData } from './template-loader'
export { TemplatePanel } from './template-panel'
export type { TemplateNode, TemplateEdge, TemplateDefinition } from './template-types'
