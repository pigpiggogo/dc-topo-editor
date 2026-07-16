export interface IRegistry<T> {
  register(key: string, item: T): void
  unregister(key: string): void
  get(key: string): T | undefined
  getAll(): T[]
  has(key: string): boolean
  filter(predicate: (item: T) => boolean): T[]
  keys(): string[]
  size(): number
}
