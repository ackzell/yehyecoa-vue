<script setup lang="ts">
import { Repl, useStore } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import '@vue/repl/style.css';
import { onMounted, ref, onUnmounted } from 'vue';
import ReplHeader from '@/components/ReplHeader.vue';
import { useStorage } from '@vueuse/core';

const preferDark = useStorage('vue-sfc-playground-prefer-dark', true);

const theme = ref<'dark' | 'light'>('dark');
function setTheme(newTheme: 'dark' | 'light') {
  theme.value = newTheme;
  preferDark.value = newTheme === 'dark';
}

const setVH = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
};

const store = useStore();
const errormessage = ref('');
let eventSource: EventSource | null = null;

onMounted(async () => {
  // Set initial viewport height
  setVH();
  window.addEventListener('resize', setVH);

  // Initial load
  try {
    const response = await fetch('/api/lesson-file');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const fileResponse = await response.json();
    const fileContents = fileResponse.content;

    if (fileContents.trim()) {
      store.setFiles({ 'src/App.vue': fileContents });
      console.log('Successfully loaded lessonFile.vue');
    }
    else {
      throw new Error('Empty file content received');
    }
  }
  catch (error) {
    errormessage.value = 'Failed to load lessonFile.vue - ensure the file exists and the API is running';
    console.error('Failed to load lessonFile.vue:', error);
  }

  // Setup live updates via SSE
  try {
    eventSource = new EventSource('/api/events');

    eventSource.addEventListener('open', () => {
      console.log('SSE connection established');
    });

    eventSource.addEventListener('fileUpdate', (event) => {
      try {
        console.log('File update received:', event.data);
        const { filename, content } = JSON.parse(event.data);

        if (filename === 'lessonFile.vue' && content) {
          store.setFiles({ 'src/App.vue': content });
          console.log('File updated successfully');

          // Clear any previous error messages on successful update
          if (errormessage.value) {
            errormessage.value = '';
          }
        }
      }
      catch (error) {
        console.error('Error processing file update:', error);
      }
    });

    eventSource.addEventListener('error', (event) => {
      console.error('SSE connection error:', event);
      if (eventSource?.readyState === EventSource.CLOSED) {
        console.log('SSE connection closed, attempting to reconnect...');
        // Optionally implement reconnection logic here
      }
    });
  }
  catch (error) {
    console.error('Failed to establish SSE connection:', error);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', setVH);
  if (eventSource) {
    eventSource.close();
    console.log('SSE connection closed');
  }
});
</script>

<template>
  <div class="repl-container">
    <div
      v-if="errormessage"
      class="error-banner"
    >
      <span class="error-icon">⚠️</span>
      {{ errormessage }}
    </div>

    <ReplHeader
      :theme="theme"
      @set-theme="setTheme"
    />

    <Repl
      :editor="Monaco"
      :show-compile-output="false"
      :show-import-map="false"
      :show-ts-config="false"
      :theme="theme"
      :editor-options="{
        autoSaveText: false,
      }"
      :store="store"
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

.error-banner {
  background-color: #dc2626;
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  border-bottom: 1px solid #b91c1c;
}

.error-icon {
  font-size: 16px;
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
