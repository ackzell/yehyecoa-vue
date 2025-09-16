<script setup lang="ts">
import { Repl } from '@calmecac-vue/repl';
import Monaco from '@calmecac-vue/repl/monaco-editor';
import { useIntervalFn } from '@vueuse/core';
import * as MonacoCore from 'monaco-editor-core';
import { onMounted } from 'vue';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useReplSync } from '@/composables/useReplSync';
import { useSettingsStore } from '@/composables/useSettingsStore';

const AUTO_SAVE_INTERVAL_MINUTES = 10 * 60 * 1000;

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
  const editor = fm.replStore.editor;

  if (!editor) {
    console.error('REPL editor instance not found.');
    return;
  }

  editor.addCommand(MonacoCore.KeyMod.CtrlCmd | MonacoCore.KeyCode.KeyS, () => {
    fm.saveSnapshot({
      type: 'manual',
      message: 'Manual save from editor',
    });
  });
});
</script>

<template>
  <div
    class="yv-repl"
    w-full h-full
    @keydown.meta.b="fm.isDrawerOpen = !fm.isDrawerOpen"
    @keydown.ctrl.b.capture.prevent.stop="fm.isDrawerOpen = !fm.isDrawerOpen"
  >
    <Repl
      :editor="Monaco"
      :show-compile-output="false"
      :show-import-map="false"
      :show-ts-config="false"
      :theme="settings.theme"
      :layout="settings.layout"
      :editor-options="{
        autoSaveText: false,
        showErrorText: false,
      }"
      :preview-theme="true"
      :store="fm.replStore"
    />
  </div>
</template>

<style>
.dark .yv-repl {
  --ghost-cursor-color: hsl(49, 71%, 50%);;

}

/* Ghost instructor cursor */
.dark .monaco-editor .instructor-cursor {
  border-left: 5px solid var(--ghost-cursor-color);
  margin-left: -1px;
  pointer-events: none;
}

/* Instructor selection highlight */
.dark .monaco-editor .instructor-selection {
  background-color: hsl(49, 71%, 30%);

  pointer-events: none;
  /* border: 1px solid var(--ghost-cursor-color); */
}

.yv-repl {
  --ghost-cursor-color: hsl(328, 71%, 50%);;
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
  /* border: 1px solid var(--ghost-cursor-color); */
}
</style>
