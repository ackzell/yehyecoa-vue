import { describe, expect, it } from 'vitest'
import type { LayoutLeaf, LayoutNode, LayoutSplit } from '../src/types'
import {
  cleanupTree,
  collectMaxSplitNumber,
  collectPanels,
  collectSplitIds,
  createSplitIdGenerator,
  ensureAllPanelsExist,
  ensureRootSplit,
  filterVisible,
  hasPanel,
  insertAtTarget,
  isAxisAlignedDrop,
  normalizeLayoutTree,
  pruneSizesMap,
  removePanel,
  splitForZone,
} from '../src/tree'

type TId = 'editor' | 'preview' | 'console' | 'terminal'
const ALL: TId[] = ['editor', 'preview', 'console', 'terminal']

const panel = (id: TId): LayoutLeaf<TId> => ({ type: 'panel', id })
const split = (id: string, direction: 'horizontal' | 'vertical', children: LayoutNode<TId>[]): LayoutSplit<TId> => ({
  type: 'split',
  id,
  direction,
  children,
})

describe('normalizeLayoutTree', () => {
  it('falls back to a fresh vertical split for nullish / garbage input', () => {
    for (const bad of [undefined, null, 42, 'x', {}, [], { type: 'panel', id: 'bogus' }]) {
      const root = normalizeLayoutTree<TId>(bad, ALL)
      expect(root.type).toBe('split')
      expect(root.children.map(c => (c as LayoutLeaf<TId>).id).sort()).toEqual([...ALL].sort())
    }
  })

  it('drops invalid and duplicate panel ids', () => {
    const tree = split('s', 'vertical', [
      panel('editor'),
      { type: 'panel', id: 'nope' } as unknown as LayoutNode<TId>,
      panel('editor'), // duplicate
      split('s2', 'horizontal', [panel('preview'), panel('preview')]),
    ])
    const root = normalizeLayoutTree<TId>(tree, ALL)
    const ids = collectPanels(root)
    expect(ids.size).toBe(ALL.length)
    for (const id of ALL)
      expect(ids.has(id)).toBe(true)
  })

  it('collapses single-child splits and tops up missing panels', () => {
    const tree = split('s', 'vertical', [split('s2', 'vertical', [panel('editor')])])
    const root = normalizeLayoutTree<TId>(tree, ALL)
    expect(collectPanels(root).size).toBe(ALL.length)
    // The single-child split-2 was collapsed.
    expect(collectSplitIds(root).has('s2')).toBe(false)
  })

  it('preserves a valid tree and its split ids', () => {
    const tree = split('s', 'horizontal', [
      split('s2', 'vertical', [panel('editor'), panel('preview')]),
      panel('console'),
      panel('terminal'),
    ])
    const root = normalizeLayoutTree<TId>(tree, ALL)
    expect(root).toEqual(tree)
  })

  it('a tree that collapses to a single panel still yields every valid panel once', () => {
    const tree = split('s', 'vertical', [panel('console')])
    const root = normalizeLayoutTree<TId>(tree, ALL)
    expect(collectPanels(root)).toEqual(new Set(ALL))
    // The surviving panel is kept first, missing ones appended.
    expect(root.children[0]).toEqual(panel('console'))
  })
})

describe('collectMaxSplitNumber', () => {
  it('returns 0 for a leaf', () => {
    expect(collectMaxSplitNumber(panel('editor'))).toBe(0)
  })

  it('returns the max numeric suffix across nested splits', () => {
    const tree = split('split-3', 'vertical', [
      split('split-12', 'horizontal', [panel('editor'), panel('preview')]),
      split('split-7', 'vertical', [panel('console'), panel('terminal')]),
    ])
    expect(collectMaxSplitNumber(tree)).toBe(12)
  })
})

describe('isAxisAlignedDrop', () => {
  it('aligns zones with the same axis only', () => {
    expect(isAxisAlignedDrop('horizontal', 'left')).toBe(true)
    expect(isAxisAlignedDrop('horizontal', 'right')).toBe(true)
    expect(isAxisAlignedDrop('horizontal', 'top')).toBe(false)
    expect(isAxisAlignedDrop('horizontal', 'bottom')).toBe(false)
    expect(isAxisAlignedDrop('vertical', 'top')).toBe(true)
    expect(isAxisAlignedDrop('vertical', 'bottom')).toBe(true)
    expect(isAxisAlignedDrop('vertical', 'left')).toBe(false)
    expect(isAxisAlignedDrop('vertical', 'right')).toBe(false)
  })
})

describe('splitForZone', () => {
  const next = createSplitIdGenerator(10)

  it('orders dragged before target for left/top and after for right/bottom', () => {
    const target = panel('preview')
    const dragged = panel('editor')

    const left = splitForZone(target, dragged, 'left', next)
    expect(left.direction).toBe('horizontal')
    expect(left.children[0]).toEqual(dragged)
    expect(left.children[1]).toEqual(target)

    const bottom = splitForZone(target, dragged, 'bottom', next)
    expect(bottom.direction).toBe('vertical')
    expect(bottom.children[0]).toEqual(target)
    expect(bottom.children[1]).toEqual(dragged)
  })
})

describe('removePanel', () => {
  it('removes the only child and collapses the emptied split', () => {
    const tree = split('s', 'horizontal', [panel('editor')])
    const result = removePanel(tree, 'editor')
    expect(result.removed).toEqual(panel('editor'))
    expect(result.node).toBeNull()
  })

  it('leaves a single-child split for cleanupTree to collapse', () => {
    const tree = split('s', 'horizontal', [panel('editor'), panel('preview')])
    const result = removePanel(tree, 'editor')
    expect(result.removed).toEqual(panel('editor'))
    expect(result.node).toEqual(split('s', 'horizontal', [panel('preview')]))
  })

  it('collapses only the emptied branch, keeping the outer split shape', () => {
    const tree = split('s', 'vertical', [
      split('s2', 'horizontal', [panel('editor'), panel('preview')]),
      panel('console'),
    ])
    const result = removePanel(tree, 'editor')
    expect(result.removed).toEqual(panel('editor'))
    expect(result.node).toEqual(
      split('s', 'vertical', [split('s2', 'horizontal', [panel('preview')]), panel('console')]),
    )
  })

  it('returns removed null and a clone when the panel is absent', () => {
    const tree = split('s', 'vertical', [panel('editor'), panel('preview')])
    const result = removePanel(tree, 'console')
    expect(result.removed).toBeNull()
    expect(result.node).toEqual(tree)
  })
})

describe('insertAtTarget', () => {
  const next = createSplitIdGenerator(20)

  it('axis-aligned drop extends the target split', () => {
    const tree = split('s', 'vertical', [panel('editor'), panel('preview')])
    const result = insertAtTarget(tree, 's', panel('console'), 'bottom', next)
    const s = result as LayoutSplit<TId>
    expect(s.children.map(c => (c as LayoutLeaf<TId>).id)).toEqual(['editor', 'preview', 'console'])
  })

  it('cross-axis drop wraps the target split', () => {
    const tree = split('s', 'vertical', [panel('editor'), panel('preview')])
    const result = insertAtTarget(tree, 's', panel('console'), 'left', next)
    const s = result as LayoutSplit<TId>
    expect(s.direction).toBe('horizontal')
    expect(s.children[0]).toEqual(panel('console'))
    expect(s.children[1]).toEqual(tree)
  })

  it('drop onto a panel leaf wraps it in a fresh split', () => {
    const tree = panel('editor')
    const result = insertAtTarget(tree, 'editor', panel('preview'), 'right', next)
    const s = result as LayoutSplit<TId>
    expect(s.type).toBe('split')
    expect(s.direction).toBe('horizontal')
    expect(s.children[0]).toEqual(panel('editor'))
    expect(s.children[1]).toEqual(panel('preview'))
  })
})

describe('cleanupTree', () => {
  it('collapses single-child splits', () => {
    const tree = split('s', 'vertical', [split('s2', 'horizontal', [panel('editor')])])
    expect(cleanupTree(tree)).toEqual(panel('editor'))
  })

  it('flattens same-direction nested splits', () => {
    const tree = split('s', 'vertical', [
      split('s2', 'vertical', [panel('editor'), panel('preview')]),
      panel('console'),
    ])
    const result = cleanupTree(tree) as LayoutSplit<TId>
    expect(result.children.map(c => (c as LayoutLeaf<TId>).id)).toEqual(['editor', 'preview', 'console'])
  })

  it('keeps cross-direction nesting intact', () => {
    const inner = split('s2', 'horizontal', [panel('editor'), panel('preview')])
    const tree = split('s', 'vertical', [inner, panel('console')])
    const result = cleanupTree(tree) as LayoutSplit<TId>
    expect(result.children[0]).toEqual(inner)
  })
})

describe('hasPanel', () => {
  const tree = split('s', 'vertical', [panel('editor'), split('s2', 'horizontal', [panel('preview'), panel('console')])])
  it('finds nested panels', () => {
    expect(hasPanel(tree, 'console')).toBe(true)
  })
  it('reports absent panels', () => {
    expect(hasPanel(tree, 'terminal')).toBe(false)
  })
})

describe('collectSplitIds', () => {
  it('collects every split id', () => {
    const tree = split('s1', 'vertical', [split('s2', 'horizontal', [panel('editor'), panel('preview')]), panel('console')])
    expect(collectSplitIds(tree)).toEqual(new Set(['s1', 's2']))
  })
})

describe('pruneSizesMap', () => {
  it('keeps only sizes for existing splits', () => {
    const tree = split('s1', 'vertical', [split('s2', 'horizontal', [panel('editor'), panel('preview')]), panel('console')])
    const sizes = { s1: [40, 60], s2: [50, 50], gone: [10, 90] }
    expect(pruneSizesMap(tree, sizes)).toEqual({ s1: [40, 60], s2: [50, 50] })
  })
})

describe('ensureRootSplit', () => {
  const next = createSplitIdGenerator(5)

  it('wraps a leaf', () => {
    const result = ensureRootSplit(panel('editor'), next)
    expect(result.type).toBe('split')
    expect(result.direction).toBe('vertical')
    expect(result.children).toEqual([panel('editor')])
  })

  it('returns a split unchanged', () => {
    const tree = split('s', 'vertical', [panel('editor'), panel('preview')])
    expect(ensureRootSplit(tree, next)).toBe(tree)
  })
})

describe('filterVisible', () => {
  const tree = split('s', 'vertical', [
    panel('editor'),
    split('s2', 'horizontal', [panel('preview'), panel('console')]),
    panel('terminal'),
  ])

  it('prunes hidden panels and empty branches', () => {
    const visible = new Set<TId>(['editor', 'console'])
    const filtered = filterVisible(tree, visible)!
    expect(collectPanels(filtered)).toEqual(visible)
    // filterVisible leaves the single-child s2 split; cleanupTree collapses it.
    expect(collectSplitIds(cleanupTree(filtered)).has('s2')).toBe(false)
  })

  it('returns null when everything is hidden', () => {
    expect(filterVisible(tree, new Set<TId>())).toBeNull()
  })
})

describe('collectPanels', () => {
  it('collects unique panel ids', () => {
    const tree = split('s', 'vertical', [panel('editor'), split('s2', 'horizontal', [panel('preview'), panel('console')])])
    expect(collectPanels(tree)).toEqual(new Set(['editor', 'preview', 'console']))
  })
})

describe('ensureAllPanelsExist', () => {
  const next = createSplitIdGenerator(30)

  it('returns the input split unchanged when all panels exist', () => {
    const tree = split('s', 'vertical', ALL.map(panel))
    expect(ensureAllPanelsExist(tree, ALL, next)).toBe(tree)
  })

  it('appends missing panels and re-cleans', () => {
    const tree = split('s', 'vertical', [panel('editor'), panel('preview')])
    const result = ensureAllPanelsExist(tree, ALL, next)
    const ids = collectPanels(result)
    for (const id of ALL)
      expect(ids.has(id)).toBe(true)
  })
})

describe('createSplitIdGenerator', () => {
  it('increments ids', () => {
    const next = createSplitIdGenerator(1)
    expect(next()).toBe('split-1')
    expect(next()).toBe('split-2')
  })
})

describe('drag/drop round-trip (MainPlayground flow)', () => {
  // Mirrors onZoneDrop: remove → insert → cleanup → ensure root → prune sizes.
  function applyDrop(tree: LayoutNode<TId>, draggedId: TId, targetId: string, zone: 'left' | 'right' | 'top' | 'bottom') {
    const next = createSplitIdGenerator(collectMaxSplitNumber(tree) + 1)
    const removal = removePanel(tree, draggedId)
    if (!removal.removed || !removal.node)
      return tree
    const inserted = insertAtTarget(removal.node, targetId, removal.removed, zone, next)
    return ensureRootSplit(cleanupTree(inserted), next)
  }

  it('moves a panel between leaves without losing panels', () => {
    const tree = split('s', 'vertical', [
      split('s2', 'horizontal', [panel('editor'), panel('preview')]),
      split('s3', 'horizontal', [panel('console'), panel('terminal')]),
    ])
    const result = applyDrop(tree, 'console', 'editor', 'top')
    const ids = collectPanels(result)
    expect(ids).toEqual(new Set(ALL))
  })
})
