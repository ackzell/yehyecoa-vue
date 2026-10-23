<script setup lang="ts">
import { computed, defineModel, provide, toRefs } from 'vue'
import type { Props } from './Repl.vue'
import { useStore } from './store'
import {
  type ConsoleComponentType,
  injectKeyProps,
} from './types'

/**
 * Headless replacement for `<Repl>`: initializes the store and provides the
 * same injection context, but renders no layout of its own. Compose
 * `ReplEditor`, `ReplPreview` and `ReplConsole` (or custom panels) inside.
 */
const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  previewTheme: false,
  console: () => ({}),
  autoResize: true,
  showCompileOutput: true,
  showOpenSourceMap: false,
  showImportMap: true,
  showSsrOutput: false,
  showTsConfig: true,
  showOutput: true,
  showConsole: false,
  clearConsole: true,
  layoutReverse: false,
  ssr: false,
  layout: 'horizontal',
  outputLayout: 'vertical',
  previewOptions: () => ({}),
  editorOptions: () => ({}),
  splitPaneOptions: () => ({}),
  store: () => useStore(),
})

const autoSave = defineModel<boolean>({ default: true })

if (!props.editor) {
  throw new Error('The "editor" prop is now required.')
}

const consoleWrapper = computed<ConsoleComponentType>(
  () => props.console ?? (() => ({})),
)

props.store.init()

provide(injectKeyProps, {
  ...toRefs(props),
  console: consoleWrapper,
  autoSave,
})
</script>

<template>
  <slot />
</template>
