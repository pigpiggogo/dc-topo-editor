import { createRegistry } from '../registry/registry.ts'
import type { SchemaDefinition, SchemaRegistry } from './types.ts'

export class SchemaRegistryImpl implements SchemaRegistry {
  private readonly registry = createRegistry<SchemaDefinition>()

  register(deviceType: string, schema: SchemaDefinition): void {
    this.registry.register(deviceType, schema)
  }

  unregister(deviceType: string): void {
    this.registry.unregister(deviceType)
  }

  getSchema(deviceType: string): SchemaDefinition | undefined {
    return this.registry.get(deviceType)
  }

  getAllSchemas(): SchemaDefinition[] {
    return this.registry.getAll()
  }

  hasSchema(deviceType: string): boolean {
    return this.registry.has(deviceType)
  }
}

export function createSchemaRegistry(): SchemaRegistry {
  return new SchemaRegistryImpl()
}
