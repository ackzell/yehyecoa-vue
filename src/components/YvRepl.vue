<script setup lang="ts">
import { Repl } from '@calmecac-vue/repl';
import Monaco from '@calmecac-vue/repl/monaco-editor';
import { useDebounceFn, useIntervalFn, watchDebounced } from '@vueuse/core';
import * as MonacoCore from 'monaco-editor-core';
import { nextTick, onMounted, watch } from 'vue';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { usePartyKitBroadcast } from '@/composables/usePartyKit';
import { useSettingsStore } from '@/composables/useSettingsStore';

const AUTO_SAVE_INTERVAL_MINUTES = 10 * 60 * 1000;

const { settings } = useSettingsStore();
const fm = useFileManagerStore();
const pkb = usePartyKitBroadcast();

type PartyKitMessage = {
  type: 'repl-update' | 'system';
  id: string;
  payload: {
    selections?: MonacoCore.Selection[];
    scrollTop?: number;
    scrollLeft?: number;
    files?: Record<string, string>;
  };
};

useIntervalFn(() => {
  fm.saveSnapshot({
    type: 'auto',
    message: 'Auto saved',
  });
}, AUTO_SAVE_INTERVAL_MINUTES);

onMounted(() => {
  const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';
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

  console.log('isInstructor', isInstructor);
  if (isInstructor) {
    console.warn('INSTRUCTOR, THIS SHOULD BE SENDING MESSAGES');
    // Send selection changes immediately
    editor.onDidChangeCursorSelection(() => {
      pkb.send({
        id: 'instructor',
        type: 'repl-update',
        payload: { selections: editor.getSelections() },
      });
    });

    // Send scroll changes, debounced to avoid flooding
    const sendScrollUpdate = useDebounceFn(() => {
      pkb.send({
        id: 'instructor',
        type: 'repl-update',
        payload: {
          scrollTop: editor.getScrollTop(),
          scrollLeft: editor.getScrollLeft(),
        },
      });
    }, 100);
    editor.onDidScrollChange(sendScrollUpdate);

    // Send file content changes
    watchDebounced(
      () => fm.replStore.getFiles(),
      (files) => {
        const payload = {
          files,
          selections: editor.getSelections(),
          scrollTop: editor.getScrollTop(),
          scrollLeft: editor.getScrollLeft(),
        };

        console.warn('INSTRUCTOR, sending repl-update', payload);
        pkb.send({
          id: 'instructor',
          type: 'repl-update',
          payload,
        });
      },
      { debounce: 0, deep: true },
    );
  }
  else {
    console.warn('ATTENDEE, receiving instructor updates...');
    pkb.onMessage((message: PartyKitMessage) => {
      if (message.type !== 'repl-update')
        return;

      console.warn('Received message', message);
      const { files, selections, scrollTop, scrollLeft } = message.payload;

      const applyImperativeUpdates = () => {
        if (!editor?.getModel())
          return;

        if (selections) {
          // Re-hydrate the selections into Monaco Selection objects, as they lose their methods during serialization
          const monacoSelections = selections.map(
            s =>
              new MonacoCore.Selection(
                s.selectionStartLineNumber,
                s.selectionStartColumn,
                s.positionLineNumber,
                s.positionColumn,
              ),
          );
          editor.setSelections(monacoSelections);
          // Reveal the primary cursor if it's off-screen
          if (monacoSelections.length > 0)
            editor.revealPositionInCenterIfOutsideViewport(monacoSelections[0].getStartPosition());
          editor.focus();
        }
        if (typeof scrollTop === 'number')
          editor.setScrollTop(scrollTop);

        if (typeof scrollLeft === 'number')
          editor.setScrollLeft(scrollLeft);
      };

      if (files) {
        // Files changed, this is a declarative update.
        // We must wait for the editor to process the new file content
        // before applying imperative updates like selections and scroll.
        const unwatch = watch(() => fm.replStore.activeFile.code, () => {
          nextTick(() => {
            applyImperativeUpdates();
            unwatch(); // This was a one-time watcher
          });
        });
        fm.replStore.setFiles(files);
      }
      else {
        // No file changes, just apply imperative updates.
        applyImperativeUpdates();
      }
    });
  }
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
