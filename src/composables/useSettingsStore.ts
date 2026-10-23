import type { LayoutSplit } from '@calmecac-vue/playground-layout';
import type { RemovableRef } from '@vueuse/core';
import { normalizeLayoutTree } from '@calmecac-vue/playground-layout';
import { useStorage } from '@vueuse/core';
import { nextTick, ref } from 'vue';

type Theme = 'dark' | 'light';
export type ReplPanelId = 'editor' | 'preview' | 'console';

const PANEL_IDS: ReplPanelId[] = ['editor', 'preview', 'console'];

/**
 * Default dock layout mirrors the previous `<Repl>` arrangement: editor on the
 * left, preview stacked above console on the right.
 */
export const DEFAULT_LAYOUT_TREE: LayoutSplit<ReplPanelId> = {
  type: 'split',
  id: 'split-1',
  direction: 'horizontal',
  children: [
    { type: 'panel', id: 'editor' },
    {
      type: 'split',
      id: 'split-2',
      direction: 'vertical',
      children: [
        { type: 'panel', id: 'preview' },
        { type: 'panel', id: 'console' },
      ],
    },
  ],
};

/** Read a legacy boolean setting so existing users keep their preferences. */
function readLegacyBoolean(key: string, fallback: boolean): boolean {
  const stored = localStorage.getItem(key);
  if (stored === null) {
    return fallback;
  }
  return stored !== 'false';
}

type YVSettings = {
  theme: RemovableRef<Theme>;
  layoutTree: RemovableRef<LayoutSplit<ReplPanelId>>;
  showPreview: RemovableRef<boolean>;
  showConsole: RemovableRef<boolean>;
  panelFileTree: RemovableRef<number>;
};

const settings = ref<YVSettings>({
  theme: useStorage<Theme>('yehyecoa-vue-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  layoutTree: useStorage<LayoutSplit<ReplPanelId>>('yehyecoa-vue-layout-tree', DEFAULT_LAYOUT_TREE),
  showPreview: useStorage<boolean>('yehyecoa-vue-show-preview', readLegacyBoolean('yehyecoa-vue-show-output', true)),
  showConsole: useStorage<boolean>('yehyecoa-vue-show-console', true),
  panelFileTree: useStorage<number>('yehyecoa-vue-panel-file-tree', 20),
});

// Normalize persisted layout tree on load (drops unknown panels/duplicates).
settings.value.layoutTree = normalizeLayoutTree(settings.value.layoutTree, PANEL_IDS);

type YVSettingsStore = {
  settings: typeof settings;
  toggleTheme: () => void;
  togglePreview: () => void;
  toggleConsole: () => void;
};

export function useSettingsStore(): YVSettingsStore {
  const cls = document.documentElement.classList;

  function toggleTheme(): void {
    settings.value.theme = settings.value.theme === 'dark' ? 'light' : 'dark';

    nextTick(() => {
      if (settings.value.theme === 'dark') {
        cls.add('dark');
      }
      else {
        cls.remove('dark');
      }
    });
  }

  function togglePreview(): void {
    settings.value.showPreview = !settings.value.showPreview;
  }

  function toggleConsole(): void {
    settings.value.showConsole = !settings.value.showConsole;
  }

  return {
    settings,
    toggleTheme,
    togglePreview,
    toggleConsole,
  };
}
