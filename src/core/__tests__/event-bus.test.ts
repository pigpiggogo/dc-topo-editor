import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createEventBus } from '../event-bus/event-bus.ts'

describe('EventBus', () => {
  it('should subscribe and receive events', () => {
    const bus = createEventBus()
    let received = false

    bus.on('canvas.nodeAdded', () => {
      received = true
    })

    bus.emit('canvas.nodeAdded', { nodeId: '1', type: 'test', position: { x: 0, y: 0 } })

    assert.strictEqual(received, true)
  })

  it('should return unsubscribe function', () => {
    const bus = createEventBus()
    let count = 0

    const unsubscribe = bus.on('canvas.nodeAdded', () => {
      count++
    })

    bus.emit('canvas.nodeAdded', { nodeId: '1', type: 'test', position: { x: 0, y: 0 } })
    assert.strictEqual(count, 1)

    unsubscribe()
    bus.emit('canvas.nodeAdded', { nodeId: '2', type: 'test', position: { x: 0, y: 0 } })
    assert.strictEqual(count, 1)
  })

  it('should support wildcard subscription', () => {
    const bus = createEventBus()
    const events: Array<{ type: string; payload: unknown }> = []

    bus.on('*', (type, payload) => {
      events.push({ type: type as string, payload })
    })

    bus.emit('canvas.nodeAdded', { nodeId: '1', type: 'test', position: { x: 0, y: 0 } })
    bus.emit('device.propertyChanged', { nodeId: '1', key: 'voltage', value: 750 })

    assert.strictEqual(events.length, 2)
    assert.strictEqual(events[0].type, 'canvas.nodeAdded')
    assert.strictEqual(events[1].type, 'device.propertyChanged')
  })

  it('should support once subscription', () => {
    const bus = createEventBus()
    let count = 0

    bus.once('canvas.nodeAdded', () => {
      count++
    })

    bus.emit('canvas.nodeAdded', { nodeId: '1', type: 'test', position: { x: 0, y: 0 } })
    bus.emit('canvas.nodeAdded', { nodeId: '2', type: 'test', position: { x: 0, y: 0 } })

    assert.strictEqual(count, 1)
  })

  it('should support typed events', () => {
    const bus = createEventBus()
    let receivedNodeId = ''
    let receivedVoltage = 0

    bus.on('device.propertyChanged', (payload) => {
      receivedNodeId = payload.nodeId
      receivedVoltage = payload.value as number
    })

    bus.emit('device.propertyChanged', { nodeId: 'node-1', key: 'voltage', value: 750 })

    assert.strictEqual(receivedNodeId, 'node-1')
    assert.strictEqual(receivedVoltage, 750)
  })

  it('should track listener count', () => {
    const bus = createEventBus()

    const handler = (): void => {}
    bus.on('canvas.nodeAdded', handler)

    assert.strictEqual(bus.getListenerCount('canvas.nodeAdded'), 1)
  })
})
