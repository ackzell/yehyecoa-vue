<script setup lang="ts">
import { Repl } from '@calmecac-vue/repl';
import Monaco from '@calmecac-vue/repl/monaco-editor';
import { useIntervalFn, watchDebounced } from '@vueuse/core';
import * as MonacoCore from 'monaco-editor-core';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { usePartyKitBroadcast } from '@/composables/usePartyKit';
import { useSettingsStore } from '@/composables/useSettingsStore';

const AUTO_SAVE_INTERVAL_MINUTES = 10 * 60 * 1000;

const { settings } = useSettingsStore();
const fm = useFileManagerStore();
const pkb = usePartyKitBroadcast();

useIntervalFn(() => {
  fm.saveSnapshot({
    type: 'auto',
    message: 'Auto saved',
  });
}, AUTO_SAVE_INTERVAL_MINUTES);

onMounted(() => {
  const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';
  const editor = fm.replStore.editor as MonacoCore.editor.IStandaloneCodeEditor;

  editor.addCommand(MonacoCore.KeyMod.CtrlCmd | MonacoCore.KeyCode.KeyS, () => {
    fm.saveSnapshot({
      type: 'manual',
      message: 'Manual save from editor',
    });
  });

  console.log('isInstructor', isInstructor);
  if (isInstructor) {
    console.warn('INSTRUCTOR, THIS SHOULD BE SENDING MESSAGES');

    const editor = fm.replStore.editor as MonacoCore.editor.IStandaloneCodeEditor;

    // editor.onDidChangeCursorSelection(() => {
    //   const state = {
    //     files: fm.replStore.getFiles(),
    //     activeFile: fm.replStore.activeFile,
    //     selections: editor.getSelections(),
    //     viewState: editor.saveViewState(), // includes scroll & cursor
    //   };

    //   pkb.send({
    //     id: 'instructor',
    //     type: 'repl-update',
    //     payload: state,
    //   });
    // });

    // // 0ms debounce for now
    // // the REPL already debounces its own changes
    // // but if it becomes an issue, we can bump up the time here
    watchDebounced(
      () => fm.replStore.getFiles(),
      () => {
        const payload = {
          files: fm.replStore.getFiles(),
          selections: editor.getSelections(),
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

    const newPosition = ref<MonacoCore.IPosition | null>(null);

    pkb.onMessage((message) => {
      console.warn('Received message', message);

      if (message.type === 'repl-update') {
        const firstSelection = message.payload.selections?.[0];
        newPosition.value = firstSelection
          ? { lineNumber: firstSelection.positionLineNumber, column: firstSelection.positionColumn }
          : { lineNumber: 1, column: 1 }; // Fallback to top of file

        // This is the declarative update. It will trigger the watcher below.
        fm.replStore.setFiles(message.payload.files);
      }
    });

    // This watcher waits for the active file's code to be updated in the store.
    // This is a more reliable signal that the declarative part of the update is in progress.
    watch(() => fm.replStore.activeFile.code, () => {
      if (!newPosition.value)
        return;

      const positionToApply = newPosition.value;
      newPosition.value = null; // Reset to avoid re-applying

      // We still need to wait for the editor component to react to the code change
      // and update its internal state. `nextTick` waits for the DOM update queue
      // to flush, which is a good point to run imperative commands.
      nextTick(() => {
        const editor = fm.replStore.editor as MonacoCore.editor.IStandaloneCodeEditor;
        if (!editor || !editor.getModel())
          return;

        editor.setPosition(positionToApply);
        editor.focus();
      });
    });
  }

  // editor.onDidChangeCursorSelection(() => {
  //   pkb.send({
  //     id: 'instructor',
  //     type: 'repl-update',
  //     files: fm.replStore.getFiles(),
  //     selections: editor.getSelections(),
  //   });
  // });
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
