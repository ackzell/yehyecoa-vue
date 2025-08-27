<script setup lang="ts">
import { Repl } from '@vue/repl';

import Monaco from '@vue/repl/monaco-editor';
import YVHeader from '@/components/YvHeader.vue';

import { useSettingsStore } from '@/composables/useSettingsStore';
import { useFileManager } from './composables/useFileManager';
import '@vue/repl/style.css';

const { settings } = useSettingsStore();
const fileManager = useFileManager();

function setVH() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
}
window.addEventListener('resize', setVH);

setVH();
</script>

<template>
  <div class="repl-container" font-sans text-primary vaul-drawer-wrapper>
    <div
      v-if="fileManager.errorMessage"
      class="error"
    >
      {{ fileManager.errorMessage }}
    </div>
    <YVHeader />
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
      :store="fileManager.replStore"
      @keydown.ctrl.s.prevent
      @keydown.meta.s.prevent
    />
  </div>
</template>

<style>
body {
  font-size: 13px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}

.repl-container {
  height: calc(var(--vh) - var(--nav-height)) !important;
  color-scheme: dark;
}

.dark {
  color-scheme: dark;
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
