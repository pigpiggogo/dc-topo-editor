export interface TemplateNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface TemplateEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: string
  data?: Record<string, unknown>
}

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  nodes: TemplateNode[]
  edges: TemplateEdge[]
}
