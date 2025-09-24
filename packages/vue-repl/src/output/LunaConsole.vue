<script setup lang="ts">
import { inject, onMounted, ref, useTemplateRef, watch } from 'vue'
import LunaConsole from 'luna-console'
import { type LogPayload, injectKeyProps } from '../types'
import 'luna-object-viewer/luna-object-viewer.css'
import 'luna-data-grid/luna-data-grid.css'
import 'luna-console/luna-console.css'

const { store, theme } = inject(injectKeyProps)!
const lunaRef = useTemplateRef('luna-ref')
const lunaConsole = ref<LunaConsole>()

onMounted(() => {
  if (!lunaRef.value) return
  lunaConsole.value = new LunaConsole(lunaRef.value, {
    theme: theme.value || 'light',
  })
  store.value.executeLog = ({ logLevel, data = [] }: LogPayload) => {
    ;(lunaConsole.value?.[logLevel] as any)?.(...data)
  }
  store.value.clearConsole = clearLunaConsole
})

function clearLunaConsole() {
  lunaConsole.value?.clear(true)
}

watch(() => store.value.activeFile.code, clearLunaConsole)
</script>

<template>
  <div class="console-wrapper">
    <div class="console-title">
      <strong>Console</strong>
      <button class="clear-btn" @click="clearLunaConsole">clear</button>
    </div>
    <div class="luna-container">
      <div ref="luna-ref" />
    </div>
  </div>
</template>

<style scoped>
.console-wrapper {
  height: 100%;
}

.luna-container {
  height: 100%;
  width: 100%;
  overflow: scroll;
}
.luna-console-theme-dark {
  background-color: var(--bg) !important;
}

.console-title {
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg);
  padding-left: 10px;
  color: var(--text-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  font-size: 0.85rem;
  font-family: var(--font-code);
  color: #999;
  padding: 0.4rem;
  margin: 0.2rem;
  background-color: var(--bg);
  border-radius: 4px;
  border: 1px solid var(--border);
  &:hover {
    color: var(--color-branding);
  }
}
</style>
