import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createRegistry } from '../registry/registry.ts'

describe('Registry', () => {
  it('should register and retrieve items', () => {
    const registry = createRegistry<string>()
    registry.register('key1', 'value1')

    assert.strictEqual(registry.get('key1'), 'value1')
    assert.strictEqual(registry.has('key1'), true)
  })

  it('should throw on duplicate registration', () => {
    const registry = createRegistry<string>()
    registry.register('key1', 'value1')

    assert.throws(() => {
      registry.register('key1', 'value2')
    }, /already registered/)
  })

  it('should unregister items', () => {
    const registry = createRegistry<string>()
    registry.register('key1', 'value1')
    registry.unregister('key1')

    assert.strictEqual(registry.has('key1'), false)
    assert.strictEqual(registry.get('key1'), undefined)
  })

  it('should throw on unregistering non-existent key', () => {
    const registry = createRegistry<string>()

    assert.throws(() => {
      registry.unregister('nonexistent')
    }, /does not exist/)
  })

  it('should return all items', () => {
    const registry = createRegistry<number>()
    registry.register('a', 1)
    registry.register('b', 2)
    registry.register('c', 3)

    const all = registry.getAll()
    assert.strictEqual(all.length, 3)
    assert.ok(all.includes(1))
    assert.ok(all.includes(2))
    assert.ok(all.includes(3))
  })

  it('should filter items', () => {
    const registry = createRegistry<number>()
    registry.register('a', 1)
    registry.register('b', 2)
    registry.register('c', 3)

    const filtered = registry.filter((item) => item > 1)
    assert.strictEqual(filtered.length, 2)
    assert.ok(filtered.includes(2))
    assert.ok(filtered.includes(3))
  })

  it('should return keys', () => {
    const registry = createRegistry<string>()
    registry.register('x', 'one')
    registry.register('y', 'two')

    const keys = registry.keys()
    assert.ok(keys.includes('x'))
    assert.ok(keys.includes('y'))
  })

  it('should track size', () => {
    const registry = createRegistry<string>()
    assert.strictEqual(registry.size(), 0)

    registry.register('a', '1')
    assert.strictEqual(registry.size(), 1)

    registry.register('b', '2')
    assert.strictEqual(registry.size(), 2)
  })
})
