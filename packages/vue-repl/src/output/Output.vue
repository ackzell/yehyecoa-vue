<script setup lang="ts">
import SsrOutput from './SsrOutput.vue'
import ReplPreview from '../ReplPreview.vue'
import ReplConsole from '../ReplConsole.vue'
import { usePaneSplit } from '../usePaneSplit'
import { computed, inject, useTemplateRef, watchEffect } from 'vue'
import {
  type EditorComponentType,
  type OutputModes,
  injectKeyProps,
} from '../types'

const props = defineProps<{
  editorComponent: EditorComponentType
  showCompileOutput?: boolean
  showOpenSourceMap?: boolean
  showSsrOutput?: boolean
  ssr: boolean
  layout: 'horizontal' | 'vertical'
  outputLayout?: 'horizontal' | 'vertical'
}>()

const { store, showConsole } = inject(injectKeyProps)!
const previewRef = useTemplateRef('preview')

const { isVertical, state, boundSplit, dragStart, dragMove, dragEnd } =
  usePaneSplit(() => props.outputLayout ?? props.layout)

const paneStyle = computed(() =>
  isVertical.value
    ? { height: `${boundSplit.value}%` }
    : { width: `${boundSplit.value}%` },
)

const modes = computed(() => {
  const outputModes: OutputModes[] = ['preview']
  if (props.showCompileOutput) {
    outputModes.push('js', 'css', 'ssr')
  }
  if (props.ssr && props.showSsrOutput) {
    outputModes.push('ssr output')
  }
  return outputModes
})

const mode = computed<OutputModes>({
  get: () => store.value.outputMode,
  set: (value) => (store.value.outputMode = value),
})

watchEffect(() => {
  if (!modes.value.includes(mode.value)) {
    mode.value = modes.value[0]
  }
})

const showSourceMap = computed(() => {
  return props.showOpenSourceMap && (mode.value === 'js' || mode.value === 'ssr')
})

function openSourceMap() {
  const { clientMap, ssrMap } = store.value.activeFile.compiled
  window.open(mode.value === 'js' ? clientMap : ssrMap)
}

function reload() {
  previewRef.value?.reload()
  store.value.clearConsole?.()
}

defineExpose({ reload })
</script>

<template>
  <div class="tab-buttons">
    <button
      v-for="m of modes"
      :key="m"
      :class="{ active: mode === m }"
      @click="mode = m"
    >
      <span>{{ m }}</span>
    </button>
  </div>

  <div class="output-container">
    <div
      v-if="showConsole"
      ref="container"
      class="output-panes"
      :class="{ dragging: state.dragging, vertical: isVertical }"
      @mousemove="dragMove"
      @mouseup="dragEnd"
      @mouseleave="dragEnd"
    >
      <div class="output-pane first-pane" :style="paneStyle">
        <ReplPreview ref="preview" :show="mode === 'preview'" />
        <div class="dragger" @mousedown.prevent="dragStart" />
      </div>
      <div class="output-pane second-pane">
        <ReplConsole />
      </div>
    </div>
    <ReplPreview
      v-else
      ref="preview"
      :show="mode === 'preview'"
    />
    <SsrOutput
      v-if="mode === 'ssr output'"
      :context="store.ssrOutput.context"
      :html="store.ssrOutput.html"
    />
    <props.editorComponent
      v-else-if="mode !== 'preview'"
      readonly
      :filename="store.activeFile.filename"
      :value="store.activeFile.compiled[mode]"
      :mode="mode"
    />
  </div>

  <div v-if="showSourceMap" class="tab-buttons open-sourcemap">
    <button>
      <span @click="openSourceMap">open sourceMap</span>
    </button>
  </div>
</template>

<style scoped>
.output-container {
  height: calc(100% - var(--header-height));
  overflow: hidden;
  position: relative;
}

.output-panes {
  display: flex;
  height: 100%;
}

.output-panes.vertical {
  flex-direction: column;
}

.output-panes.dragging {
  cursor: ew-resize;
}

.output-panes.vertical.dragging {
  cursor: ns-resize;
}

.output-pane {
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.first-pane {
  flex: 0 0 auto;
  border-right: 1px solid var(--border);
}

.vertical .first-pane {
  border-right: none;
  border-bottom: 1px solid var(--border);
}

.second-pane {
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
  left: 0;
  right: 0;
  bottom: -5px;
  width: 100%;
  height: 10px;
  cursor: ns-resize;
}

.tab-buttons {
  box-sizing: border-box;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg);
  height: var(--header-height);
  overflow: hidden;
}
.tab-buttons button {
  padding: 0;
  box-sizing: border-box;
}
.tab-buttons span {
  font-size: 13px;
  font-family: var(--font-code);
  text-transform: uppercase;
  color: var(--text-light);
  display: inline-block;
  padding: 8px 16px 6px;
  line-height: 20px;
}
button.active {
  color: var(--color-branding-dark);
  border-bottom: 3px solid var(--color-branding-dark);
}
.open-sourcemap {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
