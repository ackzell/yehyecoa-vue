/**
 * Generic panel-layout types for the calmecac-vue playground dock.
 *
 * `CodePanelId` is intentionally generic (a plain `string` base) so each app
 * can declare its own panel-id union:
 * - yehyecoa-vue:  `'editor' | 'preview' | 'console'`
 * - amoxtli-vue-2: `'editor' | 'preview' | 'console' | 'terminal'`
 *
 * All tree types/functions are generic over `TPanelId extends CodePanelId`.
 */

/** Base type for panel identifiers. Apps refine this to their own union. */
export type CodePanelId = string

/** Direction a split lays out its children. */
export type SplitDirection = 'horizontal' | 'vertical'

/** Edge of a node where a dragged panel can be dropped. */
export type DropZone = 'left' | 'right' | 'top' | 'bottom'

/** A leaf: a single panel in the layout tree. */
export interface LayoutLeaf<TPanelId extends CodePanelId = CodePanelId> {
  type: 'panel'
  id: TPanelId
}

/** An interior node: splits its children along one axis. */
export interface LayoutSplit<TPanelId extends CodePanelId = CodePanelId> {
  type: 'split'
  id: string
  direction: SplitDirection
  children: LayoutNode<TPanelId>[]
}

/** Any node in the layout tree. */
export type LayoutNode<TPanelId extends CodePanelId = CodePanelId> =
  | LayoutLeaf<TPanelId>
  | LayoutSplit<TPanelId>

/**
 * Generic nested node for the file tree. Each app maps its own file model onto
 * this shape (e.g. yehyecoa-vue uses a flat list via `filesToTree`).
 */
export interface TreeNode {
  path: string
  name: string
  children?: TreeNode[]
}
