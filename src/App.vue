<script setup lang="ts">
import YVHeader from '@/components/YvHeader.vue';

import YvRepl from './components/YvRepl.vue';
import { useFileManager } from './composables/useFileManager';
import '@vue/repl/style.css';

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
