<script setup lang="ts">
import { Repl } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useSettingsStore } from '@/composables/useSettingsStore';

const { settings } = useSettingsStore();
const fm = useFileManagerStore();
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
    @keydown.ctrl.shift.h.prevent="fm.isDrawerOpen = true"
    @keydown.meta.shift.h.prevent="fm.isDrawerOpen = true"
  />
</template>
