import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import { Position } from '@xyflow/react'
import { clearEdgePaths, registerEdgePath } from '../../edges/edge-path-registry.ts'
import { findNearestEdgeSnap } from '../../edges/edge-snap.ts'

describe('Edge snap', () => {
  beforeEach(() => {
    clearEdgePaths()
  })

  it('snaps vertically to a horizontal edge and picks the branch handle facing the source', () => {
    registerEdgePath('e1', [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ])

    const snap = findNearestEdgeSnap({ x: 50, y: 14 }, 1, 50, 30)

    assert.ok(snap)
    assert.strictEqual(snap!.edgeId, 'e1')
    assert.strictEqual(snap!.point.x, 50)
    assert.strictEqual(snap!.point.y, 0)
    assert.strictEqual(snap!.orientation, 'horizontal')
    assert.strictEqual(snap!.handlePosition, Position.Bottom)
  })

  it('snaps horizontally to a vertical edge and picks the branch handle facing the source', () => {
    registerEdgePath('e2', [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
    ])

    const snap = findNearestEdgeSnap({ x: 14, y: 50 }, 1, -20, 50)

    assert.ok(snap)
    assert.strictEqual(snap!.edgeId, 'e2')
    assert.strictEqual(snap!.point.x, 0)
    assert.strictEqual(snap!.point.y, 50)
    assert.strictEqual(snap!.orientation, 'vertical')
    assert.strictEqual(snap!.handlePosition, Position.Left)
  })

  it('returns null when the pointer is outside the snap threshold', () => {
    registerEdgePath('e3', [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ])

    const snap = findNearestEdgeSnap({ x: 50, y: 30 }, 1, 50, 60)

    assert.strictEqual(snap, null)
  })

  it('scales the snap threshold with zoom', () => {
    registerEdgePath('e4', [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ])

    const snap = findNearestEdgeSnap({ x: 50, y: 40 }, 0.5, 50, 80)

    assert.ok(snap)
    assert.strictEqual(snap!.point.y, 0)
  })
})
