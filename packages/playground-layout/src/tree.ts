import type {
  CodePanelId,
  DropZone,
  LayoutLeaf,
  LayoutNode,
  LayoutSplit,
  SplitDirection,
} from './types'

/**
 * Produces a fresh, unique split id.
 *
 * Kept as a callback (rather than an internal counter) so callers can back the
 * generator with their own state (e.g. a Vue `ref` initialized from
 * `collectMaxSplitNumber`).
 */
export type NextSplitId = () => string

/** Create a split-id generator starting at `initial` (default `1`). */
export function createSplitIdGenerator(initial = 1): NextSplitId {
  let counter = initial
  return () => `split-${counter++}`
}

// ---------------------------------------------------------------------------
// normalizeLayoutTree
// ---------------------------------------------------------------------------

function normalizeNode<TPanelId extends CodePanelId>(
  node: unknown,
  validIds: ReadonlySet<TPanelId>,
  seen: Set<TPanelId>,
  nextSplitId: NextSplitId,
): LayoutNode<TPanelId> | null {
  if (!node || typeof node !== 'object')
    return null

  const n = node as Record<string, unknown>

  if (n.type === 'panel') {
    const id = n.id as TPanelId
    if (!validIds.has(id) || seen.has(id))
      return null
    seen.add(id)
    return { type: 'panel', id }
  }

  if (n.type === 'split') {
    const direction = n.direction
    if (direction !== 'horizontal' && direction !== 'vertical')
      return null

    const childrenRaw = Array.isArray(n.children) ? n.children : []
    const children = childrenRaw
      .map(child => normalizeNode(child, validIds, seen, nextSplitId))
      .filter((child): child is LayoutNode<TPanelId> => child !== null)

    if (children.length === 0)
      return null
    if (children.length === 1)
      return children[0] ?? null

    const id = typeof n.id === 'string' && n.id.length > 0 ? n.id : nextSplitId()
    return { type: 'split', id, direction, children }
  }

  return null
}

/**
 * Normalize an arbitrary (e.g. persisted, possibly corrupt) value into a valid
 * layout tree: a root `split` containing each valid panel exactly once.
 *
 * Invalid ids, duplicate panels, malformed splits and single-child splits are
 * dropped or collapsed; missing panels are appended to the root. Falls back to
 * a fresh vertical split when the input cannot produce any valid structure.
 */
export function normalizeLayoutTree<TPanelId extends CodePanelId>(
  tree: unknown,
  validIds: readonly TPanelId[],
): LayoutSplit<TPanelId> {
  const validIdSet = new Set<TPanelId>(validIds)
  const seen = new Set<TPanelId>()
  let splitCount = 0
  const nextSplitId = () => {
    splitCount += 1
    return `split-${splitCount}`
  }

  const defaultTree = (): LayoutSplit<TPanelId> => ({
    type: 'split',
    id: 'split-1',
    direction: 'vertical',
    children: validIds.map(id => ({ type: 'panel', id })),
  })

  const rootNode = normalizeNode(tree, validIdSet, seen, nextSplitId)

  // No valid structure survived → fresh default tree.
  if (!rootNode)
    return defaultTree()

  // Root must be a split; wrap a collapsed panel.
  const root: LayoutSplit<TPanelId> = rootNode.type === 'split'
    ? rootNode
    : {
        type: 'split',
        id: 'split-1',
        direction: 'vertical',
        children: [rootNode],
      }

  // Top up any valid panel missing from the normalized tree.
  for (const id of validIds) {
    if (!seen.has(id))
      root.children.push({ type: 'panel', id })
  }

  return root
}

// ---------------------------------------------------------------------------
// Id / shape helpers
// ---------------------------------------------------------------------------

/** Largest numeric suffix across every split id in the tree (`0` if none). */
export function collectMaxSplitNumber<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
): number {
  if (node.type === 'panel')
    return 0

  const current = Number.parseInt(node.id.replace('split-', ''), 10)
  const childMax = node.children.reduce(
    (max, child) => Math.max(max, collectMaxSplitNumber(child)),
    0,
  )
  return Math.max(Number.isNaN(current) ? 0 : current, childMax)
}

/** Whether a drop zone lies on the same axis as a split's direction. */
export function isAxisAlignedDrop(direction: SplitDirection, zone: DropZone): boolean {
  return (direction === 'horizontal' && (zone === 'left' || zone === 'right'))
    || (direction === 'vertical' && (zone === 'top' || zone === 'bottom'))
}

/** Build a fresh split placing `dragged` beside `target` according to `zone`. */
export function splitForZone<TPanelId extends CodePanelId>(
  target: LayoutNode<TPanelId>,
  dragged: LayoutLeaf<TPanelId>,
  zone: DropZone,
  nextSplitId: NextSplitId,
): LayoutSplit<TPanelId> {
  const direction: SplitDirection = zone === 'left' || zone === 'right' ? 'horizontal' : 'vertical'
  const before = zone === 'left' || zone === 'top'
  return {
    type: 'split',
    id: nextSplitId(),
    direction,
    children: before ? [dragged, target] : [target, dragged],
  }
}

/**
 * Remove a panel by id from a tree. Empty splits collapse to `null`; a
 * surviving single-child split is left for `cleanupTree` to collapse.
 */
export function removePanel<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  panelId: TPanelId,
): { node: LayoutNode<TPanelId> | null, removed: LayoutLeaf<TPanelId> | null } {
  if (node.type === 'panel') {
    if (node.id === panelId)
      return { node: null, removed: node }
    return { node, removed: null }
  }

  let removed: LayoutLeaf<TPanelId> | null = null
  const children: LayoutNode<TPanelId>[] = []

  for (const child of node.children) {
    const result = removePanel(child, panelId)
    if (result.removed)
      removed = result.removed
    if (result.node)
      children.push(result.node)
  }

  if (children.length === 0)
    return { node: null, removed }

  return { node: { ...node, children }, removed }
}

/**
 * Insert `dragged` at `targetId` relative to `zone`. Drops that share the
 * target split's axis extend the split's children; cross-axis drops (and drops
 * onto a panel leaf) wrap the target in a fresh split.
 */
export function insertAtTarget<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  targetId: string,
  dragged: LayoutLeaf<TPanelId>,
  zone: DropZone,
  nextSplitId: NextSplitId,
): LayoutNode<TPanelId> {
  if (node.type === 'panel') {
    if (node.id !== targetId)
      return node
    return splitForZone(node, dragged, zone, nextSplitId)
  }

  if (node.id === targetId) {
    if (isAxisAlignedDrop(node.direction, zone)) {
      const insertAtStart = zone === 'left' || zone === 'top'
      return {
        ...node,
        children: insertAtStart
          ? [dragged, ...node.children]
          : [...node.children, dragged],
      }
    }

    return splitForZone(node, dragged, zone, nextSplitId)
  }

  return {
    ...node,
    children: node.children.map(child => insertAtTarget(child, targetId, dragged, zone, nextSplitId)),
  }
}

/** Collapse single-child splits and flatten same-direction nested splits. */
export function cleanupTree<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
): LayoutNode<TPanelId> {
  if (node.type === 'panel')
    return node

  const cleanedChildren = node.children.map(cleanupTree)

  if (cleanedChildren.length === 1)
    return cleanedChildren[0]!

  const flattenedChildren: LayoutNode<TPanelId>[] = []
  for (const child of cleanedChildren) {
    if (child.type === 'split' && child.direction === node.direction)
      flattenedChildren.push(...child.children)
    else
      flattenedChildren.push(child)
  }

  if (flattenedChildren.length === 1)
    return flattenedChildren[0]!

  return { ...node, children: flattenedChildren }
}

/** Whether `panelId` exists anywhere in the tree. */
export function hasPanel<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  panelId: TPanelId,
): boolean {
  if (node.type === 'panel')
    return node.id === panelId
  return node.children.some(child => hasPanel(child, panelId))
}

/** Collect every split id in the tree. */
export function collectSplitIds<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  ids = new Set<string>(),
): Set<string> {
  if (node.type === 'split') {
    ids.add(node.id)
    for (const child of node.children)
      collectSplitIds(child, ids)
  }
  return ids
}

/** Drop size entries whose split no longer exists in the tree. */
export function pruneSizesMap<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  sizesMap: Record<string, number[]>,
): Record<string, number[]> {
  const existingSplitIds = collectSplitIds(node)
  const next: Record<string, number[]> = {}

  for (const [key, value] of Object.entries(sizesMap)) {
    if (existingSplitIds.has(key) && Array.isArray(value))
      next[key] = value
  }

  return next
}

/** Wrap a leaf in a vertical split, or return an existing split unchanged. */
export function ensureRootSplit<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  nextSplitId: NextSplitId,
): LayoutSplit<TPanelId> {
  if (node.type === 'split')
    return node

  return {
    type: 'split',
    id: nextSplitId(),
    direction: 'vertical',
    children: [node],
  }
}

/** Prune hidden panels (and the branches that become empty); `null` if all hidden. */
export function filterVisible<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  visibleIds: ReadonlySet<TPanelId>,
): LayoutNode<TPanelId> | null {
  if (node.type === 'panel')
    return visibleIds.has(node.id) ? node : null

  const children = node.children
    .map(child => filterVisible(child, visibleIds))
    .filter((child): child is LayoutNode<TPanelId> => child !== null)

  if (children.length === 0)
    return null

  return { ...node, children }
}

/** Collect every panel id in the tree. */
export function collectPanels<TPanelId extends CodePanelId>(
  node: LayoutNode<TPanelId>,
  out = new Set<TPanelId>(),
): Set<TPanelId> {
  if (node.type === 'panel') {
    out.add(node.id)
    return out
  }

  for (const child of node.children)
    collectPanels(child, out)

  return out
}

/**
 * Ensure every `required` panel is present, appending missing ones to the root
 * and re-cleaning the result. Returns a root split (the input unchanged when
 * already a split and complete).
 */
export function ensureAllPanelsExist<TPanelId extends CodePanelId>(
  tree: LayoutNode<TPanelId>,
  required: readonly TPanelId[],
  nextSplitId: NextSplitId,
): LayoutSplit<TPanelId> {
  const existing = collectPanels(tree)

  if (required.every(id => existing.has(id)))
    return ensureRootSplit(tree, nextSplitId)

  const nextRoot = ensureRootSplit(tree, nextSplitId)
  for (const id of required) {
    if (!existing.has(id))
      nextRoot.children.push({ type: 'panel', id })
  }

  return ensureRootSplit(cleanupTree(nextRoot), nextSplitId)
}
