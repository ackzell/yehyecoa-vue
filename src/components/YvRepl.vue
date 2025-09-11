<script setup lang="ts">
import { Repl } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import { useIntervalFn } from '@vueuse/core';
// import CodeMirror from '@vue/repl/codemirror-editor';

import { watch } from 'vue';
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

const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';

console.log('isInstructor', isInstructor);
if (isInstructor) {
  console.warn('INSTRUCTOR, THIS SHOULD BE SENDING MESSAGES');

  watch(() => fm.replStore.files, () => {
    console.log('Files changed', fm.replStore.activeFile.code);

    pkb.send({
      code: fm.replStore.activeFile.code,
    });
  }, {
    deep: true,
    immediate: true,
  });
}
</script>

<template>
  <div
    class="yv-repl"
    w-full h-full
    @keydown.ctrl.s.prevent="fm.saveSnapshot({ type: 'manual', message: 'Manually saved' })"
    @keydown.meta.s.capture.prevent="fm.saveSnapshot({ type: 'manual', message: 'Manually saved' })"
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
