<script setup lang="ts">
import { Repl, useStore } from '@vue/repl'
import Monaco from '@vue/repl/monaco-editor'
import '@vue/repl/style.css'
import { onMounted, ref } from 'vue'
import ReplHeader from './ReplHeader.vue'
import { useStorage } from '@vueuse/core'

const preferDark = useStorage('vue-sfc-playground-prefer-dark', true)

const theme = ref<'dark' | 'light'>('dark')
function setTheme(newTheme: 'dark' | 'light') {
  theme.value = newTheme
  preferDark.value = newTheme == 'dark'
}

const setVH = () => {
  document.documentElement.style.setProperty('--vh', window.innerHeight + `px`)
}
window.addEventListener('resize', setVH)
setVH()

const store = useStore()

const errormessage = ref('')

onMounted(async () => {
  // Initial load
  try {
    const fileContents = await fetch('/lessonFile.vue').then((r) => r.text())
    store.setFiles({ 'src/App.vue': fileContents })
  } catch {
    errormessage.value = 'Failed to load lessonFile.vue'
    console.error(
      'Failed to load `lessonFile.vue`, makes sure you created one in the root directory.',
    )
  }

  // Live updates via SSE
  const es = new EventSource('/events')
  es.addEventListener('fileUpdate', (event) => {
    const { filename, content } = JSON.parse(event.data)
    if (filename === 'lessonFile.vue') {
      store.setFiles({ 'src/App.vue': content })
    }
  })
})
</script>

<template>
  <div class="repl-container">
    <ReplHeader :theme="theme" @set-theme="setTheme" />
    <Repl
      :editor="Monaco"
      :show-compile-output="false"
      :show-import-map="false"
      :show-ts-config="false"
      :theme="theme"
      @keydown.ctrl.s.prevent
      @keydown.meta.s.prevent
      :editor-options="{
        autoSaveText: false,
      }"
      :store
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
