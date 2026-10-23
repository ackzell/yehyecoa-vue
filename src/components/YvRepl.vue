<script setup lang="ts">
import type { DropZone, LayoutSplit } from '@calmecac-vue/playground-layout';
import type { ReplPanelId } from '@/composables/useSettingsStore';
import { Splitter } from '@ark-ui/vue';
import {
  cleanupTree,
  collectMaxSplitNumber,
  ensureAllPanelsExist,
  ensureRootSplit,
  FileTree,
  filterVisible,
  hasPanel,
  insertAtTarget,
  PlaygroundDockNode,
  pruneSizesMap,
  removePanel,
} from '@calmecac-vue/playground-layout';
import {
  ReplConsole,
  ReplEditor,
  ReplPreview,
  ReplProvider,
  useReplEditor,
} from '@calmecac-vue/repl';
import LunaConsole from '@calmecac-vue/repl/luna-console';
import Monaco from '@calmecac-vue/repl/monaco-editor';
import { useIntervalFn } from '@vueuse/core';
import * as MonacoCore from 'monaco-editor-core';
import { computed, onMounted, ref, watch } from 'vue';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useReplSync } from '@/composables/useReplSync';
import { useSettingsStore } from '@/composables/useSettingsStore';
import { filesToTree } from '@/lib/filesToTree';
import '@calmecac-vue/playground-layout/style.css';

const AUTO_SAVE_INTERVAL_MINUTES = 10 * 60 * 1000;

const VALID_PANELS: ReplPanelId[] = ['editor', 'preview', 'console'];
const HIDDEN_FILES = new Set(['import-map.json', 'tsconfig.json']);

const { settings } = useSettingsStore();
const fm = useFileManagerStore();

// Set up real-time synchronization logic.
useReplSync();

useIntervalFn(() => {
  fm.saveSnapshot({
    type: 'auto',
    message: 'Auto saved',
  });
}, AUTO_SAVE_INTERVAL_MINUTES);

onMounted(() => {
  const { getEditor } = useReplEditor();
  const editor = getEditor();

  if (editor) {
    editor.addCommand(MonacoCore.KeyMod.CtrlCmd | MonacoCore.KeyCode.KeyS, () => {
      fm.saveSnapshot({
        type: 'manual',
        message: 'Manual save from editor',
      });
    });
  }
  else {
    console.warn('Editor not available for manual save keybinding');
  }
});

// ---------------------------------------------------------------------------
// Dock layout
// ---------------------------------------------------------------------------

const visiblePanelIds = computed<ReadonlySet<ReplPanelId>>(() => {
  const ids = new Set<ReplPanelId>(['editor']);
  if (settings.value.showPreview) {
    ids.add('preview');
  }
  if (settings.value.showConsole) {
    ids.add('console');
  }
  return ids;
});

const fallbackLayout: LayoutSplit<ReplPanelId> = {
  type: 'split',
  id: 'split-fallback',
  direction: 'vertical',
  children: [{ type: 'panel', id: 'editor' }],
};

const visibleLayout = computed<LayoutSplit<ReplPanelId>>(() => {
  const filtered = filterVisible(settings.value.layoutTree, visiblePanelIds.value);
  if (!filtered) {
    return fallbackLayout;
  }
  return ensureRootSplit(cleanupTree(filtered), () => 'split-fallback');
});

const draggedPanelId = ref<ReplPanelId | null>(null);
const activeDropZone = ref<string | null>(null);
const codeSizesMap = ref<Record<string, number[]>>({});

// Monotonic split-id generator seeded past the ids already in the layout.
const splitIdCounter = ref(collectMaxSplitNumber(settings.value.layoutTree) + 1);
const nextSplitId = () => `split-${splitIdCounter.value++}`;

// Keep hidden panels in the tree so they return to their previous position.
// The rendered tree is filtered separately via `visibleLayout`.
watch(
  () => settings.value.layoutTree,
  (current) => {
    const next = ensureAllPanelsExist(current, VALID_PANELS, nextSplitId);
    if (next !== current) {
      settings.value.layoutTree = next;
    }
  },
  { deep: true, immediate: true },
);

function onDragStart(panelId: ReplPanelId) {
  draggedPanelId.value = panelId;
}

function onDragEnd() {
  draggedPanelId.value = null;
  activeDropZone.value = null;
}

function onDropZoneEnter(zoneId: string) {
  if (draggedPanelId.value) {
    activeDropZone.value = zoneId;
  }
}

function onDropZoneLeave() {
  activeDropZone.value = null;
}

function onZoneDrop(draggedId: ReplPanelId, targetId: string, zone: DropZone) {
  if (draggedId === targetId) {
    onDragEnd();
    return;
  }

  const previousLayout = settings.value.layoutTree;
  const removal = removePanel(previousLayout, draggedId);
  if (!removal.removed || !removal.node) {
    onDragEnd();
    return;
  }

  const inserted = insertAtTarget(removal.node, targetId, removal.removed, zone, nextSplitId);
  const cleaned = ensureRootSplit(cleanupTree(inserted), nextSplitId);

  // Never commit a layout that drops the dragged panel.
  if (!hasPanel(cleaned, draggedId)) {
    onDragEnd();
    return;
  }

  settings.value.layoutTree = cleaned;
  codeSizesMap.value = pruneSizesMap(cleaned, codeSizesMap.value);
  onDragEnd();
}

function onSplitResize(splitId: string, sizes: number[]) {
  codeSizesMap.value = { ...codeSizesMap.value, [splitId]: [...sizes] };
}

// ---------------------------------------------------------------------------
// File tree
// ---------------------------------------------------------------------------

const fileTreeNodes = computed(() =>
  filesToTree(Object.keys(fm.replStore.files).filter(file => !HIDDEN_FILES.has(file))),
);
const selectedFilePath = computed(() => fm.replStore.activeFile?.filename ?? '');

function onFileSelect(path: string) {
  fm.replStore.setActive(path);
}

// File-tree ⇄ editor splitter.
const fileTreePanels = [
  { id: 'file-tree-panel', minSize: 8, maxSize: 45, collapsible: true, collapsedSize: 0 },
  { id: 'editor-pane', minSize: 20, maxSize: 100 },
];

const fileTreeSizes = computed<number[]>({
  get() {
    const fileTreeSize = settings.value.panelFileTree ?? 20;
    return [fileTreeSize, Math.max(0, 100 - fileTreeSize)];
  },
  set(value) {
    settings.value.panelFileTree = value[0] ?? 20;
  },
});

function onFileTreeResize(d: { size: number[] }) {
  settings.value.panelFileTree = d.size[0] ?? settings.value.panelFileTree;
}
</script>

<template>
  <div
    class="yv-repl vue-repl"
    w-full h-full
    @keydown.meta.b="fm.isDrawerOpen = !fm.isDrawerOpen"
    @keydown.ctrl.b.capture.prevent.stop="fm.isDrawerOpen = !fm.isDrawerOpen"
  >
    <ReplProvider
      :editor="Monaco"
      :console="LunaConsole"
      :theme="settings.theme"
      :preview-theme="true"
      :show-compile-output="false"
      :show-import-map="false"
      :show-ts-config="false"
      :editor-options="{
        autoSaveText: false,
        showErrorText: false,
      }"
      :store="fm.replStore"
    >
      <PlaygroundDockNode
        :node="visibleLayout"
        :dragged-panel-id="draggedPanelId"
        :active-drop-zone="activeDropZone"
        :sizes-map="codeSizesMap"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
        @drop-zone-enter="onDropZoneEnter"
        @drop-zone-leave="onDropZoneLeave"
        @zone-drop="onZoneDrop"
        @split-resize="onSplitResize"
      >
        <template #editor>
          <div class="editor-panel" h-full w-full>
            <Splitter.Root
              :panels="fileTreePanels"
              :size="fileTreeSizes"
              h-full of-hidden
              @resize="onFileTreeResize"
            >
              <Splitter.Panel id="file-tree-panel" h-full of-hidden>
                <div
                  class="file-tree-header"
                  flex="~ items-center gap-2"
                  data-dock-drag-handle="true"
                  draggable="true"
                  title="Drag editor panel"
                >
                  <div i-ph:tree-structure-duotone flex-none aria-hidden="true" />
                  <span text-sm>Files</span>
                </div>
                <div class="file-tree-body">
                  <FileTree
                    :nodes="fileTreeNodes"
                    :selected-path="selectedFilePath"
                    @select="onFileSelect"
                  />
                </div>
              </Splitter.Panel>

              <Splitter.ResizeTrigger id="file-tree-panel:editor-pane" />

              <Splitter.Panel id="editor-pane" h-full min-h-0 of-hidden>
                <ReplEditor />
              </Splitter.Panel>
            </Splitter.Root>
          </div>
        </template>

        <template #preview>
          <div class="preview-panel" h-full w-full>
            <div
              class="preview-panel-header"
              flex="~ items-center gap-2"
              data-dock-drag-handle="true"
              draggable="true"
              title="Drag preview panel"
            >
              <div i-mynaui:desktop flex-none aria-hidden="true" />
              <span text-sm>Preview</span>
            </div>
            <div class="preview-panel-body">
              <ReplPreview />
            </div>
          </div>
        </template>

        <template #console>
          <ReplConsole />
        </template>
      </PlaygroundDockNode>
    </ReplProvider>
  </div>
</template>

<style>
.yv-repl {
  --ghost-cursor-color: hsl(328, 71%, 50%);
  --header-height: 38px;
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-soft);
}

.dark .yv-repl {
  --ghost-cursor-color: hsl(49, 71%, 50%);
}

.file-tree-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: var(--header-height);
  padding: 0 1rem;
  border-bottom: 1px dashed var(--border);
  background-color: var(--bg-soft);
  color: var(--text-light);
  user-select: none;
}

.file-tree-body {
  height: calc(100% - var(--header-height) - 1rem);
  overflow: auto;
  padding: 0.5rem 0;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: var(--header-height);
  flex: none;
  padding: 0 1rem;
  border-bottom: 1px dashed var(--border);
  background-color: var(--bg-soft);
  color: var(--text-light);
  user-select: none;
}

.preview-panel-body {
  flex: 1 1 auto;
  min-height: 0;
  height: calc(100% - var(--header-height));
}

.preview-panel-body :deep(.vue-repl) {
  height: 100%;
}

.preview-panel-body :deep(.output-container) {
  height: 100%;
}

/* Ghost instructor cursor */
.monaco-editor .instructor-cursor {
  border-left: 5px solid var(--ghost-cursor-color);
  margin-left: -1px;
  pointer-events: none;
}

/* Instructor selection highlight */
.monaco-editor .instructor-selection {
  background-color: hsl(328, 71%, 85%);
  pointer-events: none;
}

.dark .monaco-editor .instructor-cursor {
  border-left: 5px solid var(--ghost-cursor-color);
  margin-left: -1px;
  pointer-events: none;
}

.dark .monaco-editor .instructor-selection {
  background-color: hsl(49, 71%, 30%);
  pointer-events: none;
}
</style>
