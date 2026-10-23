import { filesToTree as sharedFilesToTree } from '@calmecac-vue/playground-layout';

/**
 * Adapter: convert yehyecoa-vue's flat file list (array of file paths) into
 * the generic `TreeNode[]` shape consumed by the shared `FileTree` component.
 *
 * yehyecoa-vue's file model is flat (filenames, no folders), so this just
 * wraps each path as a leaf node — the file tree is visual-only over the
 * flat model.
 */
export function filesToTree(files: string[]): ReturnType<typeof sharedFilesToTree> {
  return sharedFilesToTree(files.map(path => ({ path })));
}
