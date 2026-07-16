import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import { useBoundStore } from '../../store/index.ts'
import { AddNodeCommand, AddEdgeCommand, DeleteNodesCommand, ClearCanvasCommand, BranchOnEdgeCommand, CopyPasteCommand } from '../../commands/index.ts'
import { Position } from '@xyflow/react'
import { clearEdgePaths, registerEdgePath } from '../../edges/edge-path-registry.ts'
import { createCommandBus } from '../../core/command/command-bus.ts'

function resetStore(): void {
  useBoundStore.setState({
    nodes: [],
    edges: [],
    deviceData: new Map(),
    canUndo: false,
    canRedo: false,
    history: [],
  })
}

describe('Domain commands', () => {
  let commandBus = createCommandBus()

  beforeEach(() => {
    resetStore()
    commandBus = createCommandBus()
  })

  it('AddNodeCommand adds a node and can be undone/redone', () => {
    const node = {
      id: 'n1',
      type: 'pv_panel',
      position: { x: 10, y: 20 },
      data: { name: 'PV' },
    }
    const command = new AddNodeCommand(node, { ratedPower: 100 })

    commandBus.execute(command)
    assert.strictEqual(useBoundStore.getState().nodes.length, 1)
    assert.strictEqual(useBoundStore.getState().nodes[0].id, 'n1')
    assert.ok(useBoundStore.getState().deviceData.has('n1'))
    assert.strictEqual(commandBus.canUndo(), true)

    commandBus.undo()
    assert.strictEqual(useBoundStore.getState().nodes.length, 0)
    assert.strictEqual(commandBus.canRedo(), true)

    commandBus.redo()
    assert.strictEqual(useBoundStore.getState().nodes.length, 1)
    assert.strictEqual(useBoundStore.getState().nodes[0].id, 'n1')
  })

  it('AddEdgeCommand adds an edge and can be undone', () => {
    const store = useBoundStore.getState()
    store.addNode({ id: 'n1', type: 'pv_panel', position: { x: 0, y: 0 }, data: {} })
    store.addNode({ id: 'n2', type: 'load', position: { x: 100, y: 0 }, data: {} })

    const edge = {
      id: 'e1',
      source: 'n1',
      target: 'n2',
      type: 'default',
      data: {},
    }
    const command = new AddEdgeCommand(edge)

    commandBus.execute(command)
    assert.strictEqual(useBoundStore.getState().edges.length, 1)
    assert.strictEqual(useBoundStore.getState().edges[0].id, 'e1')

    commandBus.undo()
    assert.strictEqual(useBoundStore.getState().edges.length, 0)
  })

  it('DeleteNodesCommand removes selected nodes/edges and can be undone', () => {
    const store = useBoundStore.getState()
    store.addNode({ id: 'n1', type: 'pv_panel', position: { x: 0, y: 0 }, data: {} })
    store.addNode({ id: 'n2', type: 'load', position: { x: 100, y: 0 }, data: {} })
    store.addEdge({ id: 'e1', source: 'n1', target: 'n2', type: 'default', data: {} })

    const command = new DeleteNodesCommand(['n2'], [])

    commandBus.execute(command)
    assert.strictEqual(useBoundStore.getState().nodes.length, 1)
    assert.strictEqual(useBoundStore.getState().nodes[0].id, 'n1')
    assert.strictEqual(useBoundStore.getState().edges.length, 0)

    commandBus.undo()
    assert.strictEqual(useBoundStore.getState().nodes.length, 2)
    assert.ok(useBoundStore.getState().nodes.some((n) => n.id === 'n2'))
    assert.strictEqual(useBoundStore.getState().edges.length, 1)
    assert.strictEqual(useBoundStore.getState().edges[0].id, 'e1')
  })

  it('ClearCanvasCommand clears all nodes/edges and can be undone', () => {
    const store = useBoundStore.getState()
    store.addNode({ id: 'n1', type: 'pv_panel', position: { x: 0, y: 0 }, data: {} })
    store.addNode({ id: 'n2', type: 'load', position: { x: 100, y: 0 }, data: {} })
    store.addEdge({ id: 'e1', source: 'n1', target: 'n2', type: 'default', data: {} })
    store.setDeviceData('n1', { name: 'PV' })

    const command = new ClearCanvasCommand()

    commandBus.execute(command)
    assert.strictEqual(useBoundStore.getState().nodes.length, 0)
    assert.strictEqual(useBoundStore.getState().edges.length, 0)
    assert.strictEqual(useBoundStore.getState().deviceData.size, 0)

    commandBus.undo()
    assert.strictEqual(useBoundStore.getState().nodes.length, 2)
    assert.strictEqual(useBoundStore.getState().edges.length, 1)
    assert.strictEqual(useBoundStore.getState().deviceData.get('n1')?.name, 'PV')
  })

  it('BranchOnEdgeCommand splits an edge and creates a branch point that can be undone', () => {
    clearEdgePaths()
    const store = useBoundStore.getState()
    store.addNode({ id: 'n1', type: 'pv_panel', position: { x: 0, y: 0 }, data: {} })
    store.addNode({ id: 'n2', type: 'load', position: { x: 100, y: 0 }, data: {} })
    store.addEdge({ id: 'e1', source: 'n1', target: 'n2', type: 'orthogonal', data: { voltage: 750 } })
    registerEdgePath('e1', [
      { x: 40, y: 0 },
      { x: 140, y: 0 },
    ])

    const originalEdge = useBoundStore.getState().edges[0]
    const snap = {
      edgeId: 'e1',
      point: { x: 90, y: 0 },
      orientation: 'horizontal' as const,
      handlePosition: Position.Bottom,
    }
    const command = new BranchOnEdgeCommand({
      originalEdge,
      snap,
      sourceNodeId: 'n1',
      sourceHandleId: 'port-right',
      sourcePoint: { x: 90, y: 50 },
    })

    commandBus.execute(command)
    assert.strictEqual(useBoundStore.getState().edges.length, 3)
    assert.strictEqual(useBoundStore.getState().nodes.length, 3)
    assert.ok(!useBoundStore.getState().edges.some((e) => e.id === 'e1'))
    assert.ok(useBoundStore.getState().nodes.some((n) => n.type === 'branch_point'))

    commandBus.undo()
    assert.strictEqual(useBoundStore.getState().edges.length, 1)
    assert.strictEqual(useBoundStore.getState().nodes.length, 2)
    assert.ok(useBoundStore.getState().edges.some((e) => e.id === 'e1'))
  })

  it('CopyPasteCommand duplicates selected nodes, internal edges and device data', () => {
    useBoundStore.getState().addNode({ id: 'n1', type: 'pv_panel', position: { x: 0, y: 0 }, data: { name: 'PV1' } })
    useBoundStore.getState().addNode({ id: 'n2', type: 'load', position: { x: 100, y: 50 }, data: { name: 'Load' } })
    useBoundStore.getState().setDeviceData('n1', { ratedPower: 100 })
    useBoundStore.getState().addEdge({ id: 'e1', source: 'n1', target: 'n2', type: 'orthogonal', data: { voltage: 750 } })

    const state = useBoundStore.getState()
    const selectedNodes = state.nodes.filter((n) => n.id === 'n1' || n.id === 'n2')
    const payload = {
      nodes: selectedNodes,
      edges: state.edges,
      deviceData: new Map<string, Record<string, unknown>>([['n1', state.getDeviceData('n1')!]]),
    }

    const command = new CopyPasteCommand(payload, { x: 20, y: 20 })
    commandBus.execute(command)

    assert.strictEqual(useBoundStore.getState().nodes.length, 4)
    assert.strictEqual(useBoundStore.getState().edges.length, 2)
    assert.strictEqual(useBoundStore.getState().deviceData.size, 2)

    const pastedNodes = useBoundStore.getState().nodes.filter((n) => !['n1', 'n2'].includes(n.id))
    assert.strictEqual(pastedNodes.length, 2)
    assert.ok(pastedNodes.every((n) => n.selected))

    const pastedEdges = useBoundStore.getState().edges.filter((e) => e.id !== 'e1')
    assert.strictEqual(pastedEdges.length, 1)
    const pastedEdge = pastedEdges[0]
    assert.ok(pastedNodes.some((n) => n.id === pastedEdge.source))
    assert.ok(pastedNodes.some((n) => n.id === pastedEdge.target))

    const pastedPv = pastedNodes.find((n) => n.type === 'pv_panel')
    assert.ok(pastedPv)
    assert.strictEqual(pastedPv!.position.x, 20)
    assert.strictEqual(pastedPv!.position.y, 20)
    assert.strictEqual(useBoundStore.getState().getDeviceData(pastedPv!.id)?.ratedPower, 100)

    commandBus.undo()
    assert.strictEqual(useBoundStore.getState().nodes.length, 2)
    assert.strictEqual(useBoundStore.getState().edges.length, 1)
    assert.strictEqual(useBoundStore.getState().deviceData.size, 1)
    assert.ok(useBoundStore.getState().nodes.every((n) => ['n1', 'n2'].includes(n.id)))
  })

  it('CopyPasteCommand does not copy edges connected to unselected nodes', () => {
    useBoundStore.getState().addNode({ id: 'n1', type: 'pv_panel', position: { x: 0, y: 0 }, data: {} })
    useBoundStore.getState().addNode({ id: 'n2', type: 'load', position: { x: 100, y: 0 }, data: {} })
    useBoundStore.getState().addNode({ id: 'n3', type: 'grid', position: { x: 200, y: 0 }, data: {} })
    useBoundStore.getState().addEdge({ id: 'e1', source: 'n1', target: 'n2', type: 'orthogonal', data: {} })
    useBoundStore.getState().addEdge({ id: 'e2', source: 'n2', target: 'n3', type: 'orthogonal', data: {} })

    const state = useBoundStore.getState()
    const selectedNodes = state.nodes.filter((n) => n.id === 'n1' || n.id === 'n2')
    const payload = {
      nodes: selectedNodes,
      edges: state.edges,
      deviceData: new Map<string, Record<string, unknown>>(),
    }

    const command = new CopyPasteCommand(payload, { x: 10, y: 10 })
    commandBus.execute(command)

    assert.strictEqual(useBoundStore.getState().nodes.length, 5)
    assert.strictEqual(useBoundStore.getState().edges.length, 3)
    assert.ok(!useBoundStore.getState().edges.some((e) => e.id !== 'e1' && e.id !== 'e2' && e.source === 'n2'))
  })
})
