export interface KDNode<T> {
  point: [number, number, number]
  data: T
  axis: number
  left: KDNode<T> | null
  right: KDNode<T> | null
}

export interface NeighborResult<T> {
  point: [number, number, number]
  data: T
  dist2: number
}

export function buildKDTree<T>(
  items: { point: [number, number, number]; data: T }[],
  depth = 0,
): KDNode<T> | null {
  if (items.length === 0) return null
  const axis = depth % 3
  const sorted = [...items].sort((a, b) => a.point[axis] - b.point[axis])
  const mid = sorted.length >> 1
  return {
    point: sorted[mid].point,
    data: sorted[mid].data,
    axis,
    left: buildKDTree(sorted.slice(0, mid), depth + 1),
    right: buildKDTree(sorted.slice(mid + 1), depth + 1),
  }
}

function sqDist(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2]
  return dx * dx + dy * dy + dz * dz
}

function nearestInner<T>(
  node: KDNode<T> | null,
  target: [number, number, number],
  best: NeighborResult<T> | null,
): NeighborResult<T> | null {
  if (!node) return best
  const d2 = sqDist(node.point, target)
  if (!best || d2 < best.dist2) {
    best = { point: node.point, data: node.data, dist2: d2 }
  }
  const axis = node.axis
  const diff = target[axis] - node.point[axis]
  const nearChild = diff < 0 ? node.left : node.right
  const farChild = diff < 0 ? node.right : node.left
  best = nearestInner(nearChild, target, best)
  if (diff * diff < (best?.dist2 ?? Infinity)) {
    best = nearestInner(farChild, target, best)
  }
  return best
}

export function nearest<T>(
  tree: KDNode<T> | null,
  target: [number, number, number],
): NeighborResult<T> | null {
  return nearestInner(tree, target, null)
}
