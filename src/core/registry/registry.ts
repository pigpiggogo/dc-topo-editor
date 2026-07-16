import type { IRegistry } from './types'

export class Registry<T> implements IRegistry<T> {
  private readonly items: Map<string, T>

  constructor() {
    this.items = new Map()
  }

  register(key: string, item: T): void {
    if (this.items.has(key)) {
      throw new Error(`Registry: key "${key}" is already registered`)
    }
    this.items.set(key, item)
  }

  unregister(key: string): void {
    if (!this.items.has(key)) {
      throw new Error(`Registry: key "${key}" does not exist`)
    }
    this.items.delete(key)
  }

  get(key: string): T | undefined {
    return this.items.get(key)
  }

  getAll(): T[] {
    return Array.from(this.items.values())
  }

  has(key: string): boolean {
    return this.items.has(key)
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate)
  }

  keys(): string[] {
    return Array.from(this.items.keys())
  }

  size(): number {
    return this.items.size
  }
}

export function createRegistry<T>(): IRegistry<T> {
  return new Registry<T>()
}
