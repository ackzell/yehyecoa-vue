<script setup lang="ts">
import { Repl } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import { useIntervalFn } from '@vueuse/core';
// import CodeMirror from '@vue/repl/codemirror-editor';

import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useSettingsStore } from '@/composables/useSettingsStore';

const AUTO_SAVE_INTERVAL_MINUTES = 3 * 60 * 1000;

const { settings } = useSettingsStore();
const fm = useFileManagerStore();

useIntervalFn(() => {
  fm.saveSnapshot({
    type: 'auto',
    message: 'Auto saved',
  });
}, AUTO_SAVE_INTERVAL_MINUTES);
</script>

<template>
  <Repl
    :editor="Monaco"
    :show-compile-output="false"
    :show-import-map="false"
    :show-ts-config="false"
    :theme="settings.theme"
    :layout="settings.layout"
    :editor-options="{
      autoSaveText: false,
    }"
    :preview-theme="true"
    :store="fm.replStore"
    @keydown.ctrl.s.prevent="fm.saveSnapshot({ type: 'manual', message: 'Manually saved' })"
    @keydown.meta.s.capture.prevent="fm.saveSnapshot({ type: 'manual', message: 'Manually saved' })"
    @keydown.ctrl.shift.h.prevent="fm.isDrawerOpen = true"
    @keydown.meta.shift.h.prevent="fm.isDrawerOpen = true"
  />
</template>
