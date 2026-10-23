<script setup lang="ts">
import Output from './output/Output.vue'
import ReplEditor from './ReplEditor.vue'
import ReplProvider from './ReplProvider.vue'
import { usePaneSplit } from './usePaneSplit'
import { computed, useTemplateRef } from 'vue'
import type {
  ConsoleComponentType,
  EditorComponentType,
} from './types'
import { type Store, useStore } from './store'
import type * as monaco from 'monaco-editor-core'
import LunaConsole from './output/luna-console.vue'

export interface Props {
  theme?: 'dark' | 'light'
  previewTheme?: boolean
  editor: EditorComponentType
  console?: ConsoleComponentType
  store?: Store
  autoResize?: boolean
  showCompileOutput?: boolean
  showOpenSourceMap?: boolean
  showImportMap?: boolean
  showSsrOutput?: boolean
  showTsConfig?: boolean
  showConsole?: boolean
  clearConsole?: boolean
  showOutput?: boolean
  layout?: 'horizontal' | 'vertical'
  outputLayout?: 'horizontal' | 'vertical'
  layoutReverse?: boolean
  ssr?: boolean
  previewOptions?: {
    headHTML?: string
    bodyHTML?: string
    placeholderHTML?: string
    customCode?: {
      importCode?: string
      useCode?: string
    }
    showRuntimeError?: boolean
    showRuntimeWarning?: boolean
  }
  editorOptions?: {
    showErrorText?: string | false
    autoSaveText?: string | false
    monacoOptions?: monaco.editor.IStandaloneEditorConstructionOptions
  }
  splitPaneOptions?: {
    codeTogglerText?: string
    outputTogglerText?: string
  }
}

const autoSave = defineModel<boolean>({ default: true })
const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  previewTheme: false,
  console: LunaConsole,
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

if (!props.editor) {
  throw new Error('The "editor" prop is now required.')
}

const outputRef = useTemplateRef('output')

// `props.store` is the shared ReplStore instance, not a prop value we own;
// keep a local alias so toggling output visibility is not flagged as a prop
// mutation.
const store = props.store

const { isVertical, state, boundSplit, dragStart, dragMove, dragEnd } =
  usePaneSplit(() => props.layout)

const paneStyle = computed(() =>
  isVertical.value
    ? { height: `${boundSplit.value}%` }
    : { width: `${boundSplit.value}%` },
)

function toggleOutput() {
  store.showOutput = !store.showOutput
}

/**
 * Reload the preview iframe
 */
function reload() {
  outputRef.value?.reload()
}

defineExpose({ reload })
</script>

<template>
  <ReplProvider v-bind="props" v-model="autoSave">
    <div class="vue-repl">
      <div
        ref="container"
        class="repl-layout"
        :class="{
          dragging: state.dragging,
          vertical: isVertical,
          reverse: props.layoutReverse,
          'show-output': store.showOutput,
          'has-output': props.showOutput,
        }"
        @mousemove="dragMove"
        @mouseup="dragEnd"
        @mouseleave="dragEnd"
      >
        <div
          class="repl-pane editor-pane"
          :style="props.showOutput ? paneStyle : undefined"
        >
          <ReplEditor />
          <div
            v-if="props.showOutput"
            class="dragger"
            @mousedown.prevent="dragStart"
          />
        </div>

        <div v-if="props.showOutput" class="repl-pane output-pane">
          <Output
            ref="output"
            :editor-component="editor"
            :show-compile-output="props.showCompileOutput"
            :show-open-source-map="props.showOpenSourceMap"
            :show-ssr-output="props.showSsrOutput"
            :layout="outputLayout"
            :ssr="!!props.ssr"
          />
        </div>

        <button v-if="props.showOutput" class="toggler" @click="toggleOutput">
          {{
            store.showOutput
              ? splitPaneOptions?.codeTogglerText || '< Code'
              : splitPaneOptions?.outputTogglerText || 'Output >'
          }}
        </button>
      </div>
    </div>
  </ReplProvider>
</template>

<style>
.vue-repl {
  --bg: #fff;
  --bg-soft: #f8f8f8;
  --border: #ddd;
  --text-light: #888;
  --font-code: Menlo, Monaco, Consolas, 'Courier New', monospace;
  --color-branding: #42b883;
  --color-branding-dark: #416f9c;
  --header-height: 38px;

  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-soft);
}

.dark .vue-repl {
  --bg: #1a1a1a;
  --bg-soft: #242424;
  --border: #383838;
  --text-light: #aaa;
  --color-branding: #42d392;
  --color-branding-dark: #89ddff;
}

.vue-repl button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>

<style scoped>
.repl-layout {
  display: flex;
  height: 100%;
  position: relative;
}

.repl-layout.dragging {
  cursor: ew-resize;
}

.repl-layout.vertical {
  flex-direction: column;
}

.repl-layout.vertical.dragging {
  cursor: ns-resize;
}

.repl-pane {
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.editor-pane {
  border-right: 1px solid var(--border);
  flex: 0 0 auto;
}

.vertical .editor-pane {
  border-right: none;
  border-bottom: 1px solid var(--border);
}

.repl-layout:not(.has-output) .editor-pane {
  flex: 1 1 0;
}

.output-pane {
  flex: 1 1 0;
}

.dragger {
  position: absolute;
  z-index: 3;
  top: 0;
  bottom: 0;
  right: -5px;
  width: 10px;
  cursor: ew-resize;
}

.vertical .dragger {
  top: auto;
  height: 10px;
  width: 100%;
  left: 0;
  right: 0;
  bottom: -5px;
  cursor: ns-resize;
}

.toggler {
  display: none;
  z-index: 3;
  font-family: var(--font-code);
  color: var(--text-light);
  position: absolute;
  left: 50%;
  bottom: 20px;
  background-color: var(--bg);
  padding: 8px 12px;
  border-radius: 8px;
  transform: translateX(-50%);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.dark .toggler {
  background-color: var(--bg);
}

@media (max-width: 720px) {
  .repl-pane {
    position: absolute;
    inset: 0;
    width: auto !important;
    height: auto !important;
  }

  .dragger {
    display: none;
  }

  .toggler {
    display: block;
  }

  .repl-layout .output-pane,
  .repl-layout.show-output.reverse .output-pane,
  .repl-layout.show-output .editor-pane,
  .repl-layout.reverse .editor-pane {
    z-index: -1;
    pointer-events: none;
  }

  .repl-layout .editor-pane,
  .repl-layout.show-output.reverse .editor-pane,
  .repl-layout.show-output .output-pane,
  .repl-layout.reverse .output-pane {
    z-index: 0;
    pointer-events: all;
  }
}
</style>
