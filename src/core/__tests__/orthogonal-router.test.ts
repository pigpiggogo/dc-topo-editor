import { describe, it } from 'node:test'
import assert from 'node:assert'
import { getPathMidpoint } from '../../edges/orthogonal-router.ts'

describe('Orthogonal router utilities', () => {
  it('getPathMidpoint returns the geometric center of a single segment', () => {
    const midpoint = getPathMidpoint([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ])

    assert.strictEqual(midpoint.x, 50)
    assert.strictEqual(midpoint.y, 0)
  })

  it('getPathMidpoint places the label at the halfway point along an L-shaped path', () => {
    const midpoint = getPathMidpoint([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 100 },
    ])

    // Total length 150, halfway is 75: 50 along horizontal + 25 down vertical
    assert.strictEqual(midpoint.x, 50)
    assert.strictEqual(midpoint.y, 25)
  })

  it('getPathMidpoint handles a path with multiple bends', () => {
    const midpoint = getPathMidpoint([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 100 },
    ])

    // Total length 300, halfway is 150
    assert.strictEqual(midpoint.x, 100)
    assert.strictEqual(midpoint.y, 50)
  })

  it('getPathMidpoint returns the first point for a degenerate path', () => {
    const midpoint = getPathMidpoint([{ x: 10, y: 20 }])

    assert.strictEqual(midpoint.x, 10)
    assert.strictEqual(midpoint.y, 20)
  })
})
