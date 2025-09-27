<script setup lang="ts">
import { computed, inject, reactive, useTemplateRef } from 'vue'
import { injectKeyPreviewRef, injectKeyProps } from './types'

const props = defineProps<{ layout?: 'horizontal' | 'vertical' }>()
const isVertical = computed(() => props.layout === 'vertical')

const containerRef = useTemplateRef('container')
const previewRef = inject(injectKeyPreviewRef)!

const { store, layoutReverse, splitPaneOptions } = inject(injectKeyProps)!

const state = reactive({
  dragging: false,
  split: 50,
  viewHeight: 0,
  viewWidth: 0,
})

const boundSplit = computed(() => {
  const { split } = state
  return split < 20 ? 20 : split > 80 ? 80 : split
})

let startPosition = 0
let startSplit = 0

function dragStart(e: MouseEvent) {
  state.dragging = true
  startPosition = isVertical.value ? e.pageY : e.pageX
  startSplit = boundSplit.value

  changeViewSize()
}

function dragMove(e: MouseEvent) {
  if (containerRef.value && state.dragging) {
    const position = isVertical.value ? e.pageY : e.pageX
    const totalSize = isVertical.value
      ? containerRef.value.offsetHeight
      : containerRef.value.offsetWidth
    const dp = position - startPosition
    state.split = startSplit + +((dp / totalSize) * 100).toFixed(2)

    changeViewSize()
  }
}

function dragEnd() {
  state.dragging = false
}

function changeViewSize() {
  const el = previewRef.value
  if (!el) return
  state.viewHeight = el.offsetHeight
  state.viewWidth = el.offsetWidth
}
</script>

<template>
  <div
    ref="container" class="output-split-pane" :class="{
      'osp-dragging': state.dragging,
      reverse: layoutReverse,
      vertical: isVertical,
    }" @mousemove="dragMove" @mouseup="dragEnd" @mouseleave="dragEnd"
  >
    <div class="first" :style="{ [isVertical ? 'height' : 'width']: boundSplit + '%' }">
      <slot name="first" />
      <div class="dragger" @mousedown.prevent="dragStart" />
    </div>
    <div class="second" :style="{ [isVertical ? 'height' : 'width']: 100 - boundSplit + '%' }">
      <div v-show="state.dragging" class="view-size">
        {{ `${state.viewWidth}px x ${state.viewHeight}px` }}
      </div>
      <slot name="second" />
    </div>

    <button class="toggler" @click="store.showOutput = !store.showOutput">
      {{
        store.showOutput
          ? splitPaneOptions?.codeTogglerText || '< Code' : splitPaneOptions?.outputTogglerText || 'Output >' }}
    </button>
  </div>
</template>

<style scoped>
.output-split-pane {
  display: flex;
  flex-direction: row;
  height: 100%;
  position: relative;
}

.output-split-pane.osp-dragging {
  cursor: ew-resize;
}

.osp-dragging .first,
.osp-dragging .second {
  pointer-events: none;
}

.first,
.second {
  position: relative;
  height: 100%;
}

.view-size {
  position: absolute;
  top: 40px;
  left: 10px;
  font-size: 12px;
  color: var(--text-light);
  z-index: 100;
  background-color: var(--bg-soft);
  padding: 0.5rem;
  border-radius: 4px;
}

.first {
  border-right: 1px solid var(--border);
}

.dragger {
  position: absolute;
  z-index: 3;
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


.output-split-pane:not(.vertical) .dragger {
  top: 0;
  bottom: 0;
  left: auto;
  right: -5px;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
}

.output-split-pane.vertical {
  flex-direction: column;
}

.output-split-pane.vertical.osp-dragging {
  cursor: ns-resize;
}

.vertical .first,
.vertical .second {
  width: 100%;
}

.vertical .first {
  border-right: none;
  border-bottom: 1px solid var(--border);
}
</style>
