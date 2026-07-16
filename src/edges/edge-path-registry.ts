import type { OrthogonalPathPoint } from './orthogonal-router.ts'

const edgePaths = new Map<string, OrthogonalPathPoint[]>()

export function registerEdgePath(edgeId: string, points: OrthogonalPathPoint[]): void {
  edgePaths.set(edgeId, points)
}

export function unregisterEdgePath(edgeId: string): void {
  edgePaths.delete(edgeId)
}

export function getEdgePath(edgeId: string): OrthogonalPathPoint[] | undefined {
  return edgePaths.get(edgeId)
}

export function getAllEdgePaths(): Map<string, OrthogonalPathPoint[]> {
  return edgePaths
}

export function clearEdgePaths(): void {
  edgePaths.clear()
}
