<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
import YVHeader from '@/components/YvHeader.vue';
import { useSettingsStore } from '@/composables/useSettingsStore';

import YvRepl from './components/YvRepl.vue';
import { useFileManagerStore } from './composables/useFileManagerStore';
import 'vue-sonner/style.css'; // vue-sonner v2 requires this import
import '@vue/repl/style.css';

const fileManager = useFileManagerStore();
const { settings } = useSettingsStore();

function setVH() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
}
window.addEventListener('resize', setVH);

setVH();
</script>

<template>
  <Toaster :theme="settings.theme" />

  <div class="repl-container" font-sans text-primary vaul-drawer-wrapper>
    <div
      v-if="fileManager.errorMessage"
      text="sm red-300 center"
      font-mono
      bg-red-900
    >
      {{ fileManager.errorMessage }}
    </div>
    <YVHeader />
    <YvRepl />
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
