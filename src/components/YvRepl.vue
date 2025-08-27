<script setup lang="ts">
import { Repl } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import { useFileManager } from '@/composables/useFileManager';
import { useSettingsStore } from '@/composables/useSettingsStore';

const { settings } = useSettingsStore();
const fm = useFileManager();
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
    :store="fm.replStore"
    @keydown.ctrl.s.prevent="fm.saveSnapshot()"
    @keydown.meta.s.capture.prevent="fm.saveSnapshot()"
  />
</template>
