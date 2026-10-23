<script setup lang="ts" generic="TPanelId extends string">
import { ref, computed, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue'
import { Splitter } from '@ark-ui/vue'
import type { CodePanelId, DropZone, LayoutNode } from './types'

defineOptions({
  name: 'PlaygroundDockNode',
})

const props = withDefaults(defineProps<{
  node: LayoutNode<TPanelId>
  draggedPanelId: TPanelId | null
  activeDropZone: string | null
  sizesMap?: Record<string, number[]>
  path?: string
}>(), {
  path: 'root',
})

const emit = defineEmits<{
  dragStart: [id: TPanelId]
  dragEnd: []
  dropZoneEnter: [zoneId: string]
  dropZoneLeave: []
  zoneDrop: [draggedId: TPanelId, targetId: string, zone: DropZone]
  splitResize: [splitId: string, sizes: number[]]
}>()

const ZONES: DropZone[] = ['top', 'bottom', 'left', 'right']

const slots = getCurrentInstance()?.slots ?? {}

// Slot names passed to this instance, re-forwarded to recursively rendered
// child nodes so leaf panels keep their content at any nesting depth.
const forwardedSlots = computed<string[]>(() => Object.keys(slots))

const splitWrapper = ref<HTMLElement | null>(null)
const splitExtent = ref(0)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!splitWrapper.value || props.node.type !== 'split')
    return

  const updateExtent = () => {
    if (!splitWrapper.value || props.node.type !== 'split')
      return
    const rect = splitWrapper.value.getBoundingClientRect()
    splitExtent.value = props.node.direction === 'vertical' ? rect.height : rect.width
  }

  updateExtent()
  resizeObserver = new ResizeObserver(updateExtent)
  resizeObserver.observe(splitWrapper.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

function panelId(path: string, index: number) {
  return `${path}-panel-${index}`
}

function childPath(path: string, index: number) {
  return `${path}-${index}`
}

function triggerId(path: string, index: number): `${string}:${string}` {
  return `${panelId(path, index)}:${panelId(path, index + 1)}`
}

function zoneClassname(zoneId: string) {
  return props.activeDropZone === zoneId ? 'zone-active' : ''
}

function panelMinimums(node: LayoutNode<TPanelId>): number[] {
  if (node.type !== 'split' || node.children.length === 0)
    return []

  const minPixels = node.children.map((child) => {
    if (child.type === 'panel')
      return node.direction === 'vertical' ? 36 : 96
    return 96
  })

  const totalPixels = minPixels.reduce((sum, value) => sum + value, 0)
  const usableExtent = Math.max(splitExtent.value, totalPixels * 2, 1)
  const mins = minPixels.map(pixels => Math.min((pixels / usableExtent) * 100, 100))
  const total = mins.reduce((sum, value) => sum + value, 0)

  if (total <= 100)
    return mins

  return mins.map(value => (value / total) * 100)
}

function splitPanels(node: LayoutNode<TPanelId>, path: string) {
  if (node.type !== 'split')
    return []

  const mins = panelMinimums(node)

  return node.children.map((_, index) => ({
    id: panelId(path, index),
    minSize: mins[index] ?? 0,
    maxSize: 100,
    collapsible: false,
  }))
}

function currentSizes(node: LayoutNode<TPanelId>) {
  if (node.type !== 'split' || node.children.length === 0)
    return []

  const cached = props.sizesMap?.[node.id]
  if (cached && cached.length === node.children.length)
    return cached

  const each = 100 / node.children.length
  return node.children.map((_, idx) =>
    idx === node.children.length - 1 ? 100 - each * (node.children.length - 1) : each,
  )
}

function handleDragStart(e: DragEvent, panelIdValue: TPanelId) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/x-panel-id', panelIdValue)
    e.dataTransfer.effectAllowed = 'move'
  }

  requestAnimationFrame(() => {
    emit('dragStart', panelIdValue)
  })
}

function handleDrop(e: DragEvent, targetId: string, zone: DropZone) {
  const draggedId = e.dataTransfer?.getData('text/x-panel-id') as TPanelId | undefined
  if (!draggedId)
    return
  emit('zoneDrop', draggedId, targetId, zone)
}

function onSplitResize(d: { size: number[] }) {
  if (props.node.type === 'split') {
    emit('splitResize', props.node.id, d.size)
  }
}

function isFromDragHandle(e: DragEvent) {
  const target = e.target
  let element: Element | null = null

  if (target instanceof Element)
    element = target
  else if (target instanceof Node)
    element = target.parentElement

  if (!element)
    return false

  // Don't start drag from interactive controls inside headers
  if (element.closest('button, input, select, textarea, a'))
    return false

  return Boolean(element.closest('[data-dock-drag-handle="true"]'))
}

function onPanelBodyDragStart(e: DragEvent, panelIdValue: TPanelId) {
  if (!isFromDragHandle(e))
    return
  handleDragStart(e, panelIdValue)
}

function onPanelBodyDragStartCapture(e: DragEvent) {
  if (props.node.type !== 'panel')
    return
  onPanelBodyDragStart(e, props.node.id as TPanelId)
}

function onPanelBodyDragEnd() {
  // `dragend` only fires on the drag source, so any drag ending inside this
  // panel belongs to it — always clear the drag state.
  emit('dragEnd')
}

function laneStyle(index: number, total: number, side: 'top' | 'bottom' | 'left' | 'right') {
  const step = 100 / Math.max(total, 1)
  if (side === 'top' || side === 'bottom') {
    return {
      left: `${index * step}%`,
      width: `${step}%`,
    }
  }

  return {
    top: `${index * step}%`,
    height: `${step}%`,
  }
}

function splitChildrenWithIndex(node: LayoutNode<TPanelId>) {
  if (node.type !== 'split')
    return []

  return node.children
    .map((child, idx) => ({ child, idx }))
    .filter(({ child }) => child.type === 'split')
}
</script>

<template>
  <div
    v-if="node.type === 'split'"
    ref="splitWrapper"
    class="dock-split-wrapper"
  >
    <Splitter.Root
      class="dock-split-root"
      :orientation="node.direction"
      :panels="splitPanels(node, path)"
      :size="currentSizes(node)"
      @resize="onSplitResize"
    >
      <template v-for="(child, idx) in node.children" :key="`${path}-${idx}`">
        <Splitter.Panel :id="panelId(path, idx)">
          <div class="dock-child-fill">
            <PlaygroundDockNode
              :node="child"
              :path="childPath(path, idx)"
              :dragged-panel-id="draggedPanelId"
              :active-drop-zone="activeDropZone"
              :sizes-map="sizesMap"
              @drag-start="(id) => emit('dragStart', id)"
              @drag-end="emit('dragEnd')"
              @drop-zone-enter="(zoneId) => emit('dropZoneEnter', zoneId)"
              @drop-zone-leave="emit('dropZoneLeave')"
              @zone-drop="(draggedId, targetId, zone) => emit('zoneDrop', draggedId, targetId, zone)"
              @split-resize="(splitId, sizes) => emit('splitResize', splitId, sizes)"
            >
              <template v-for="slotName in forwardedSlots" :key="slotName" #[slotName]>
                <slot :name="slotName" />
              </template>
            </PlaygroundDockNode>
          </div>
        </Splitter.Panel>

        <Splitter.ResizeTrigger
          v-if="idx < node.children.length - 1"
          :id="triggerId(path, idx)"
          class="dock-resize-trigger"
        >
          <Splitter.ResizeTriggerIndicator class="dock-resize-indicator" />
        </Splitter.ResizeTrigger>
      </template>
    </Splitter.Root>

    <div
      v-if="draggedPanelId"
      class="split-zones-overlay"
    >
      <div
        v-for="zone in ZONES"
        :key="`split-${node.id}-${zone}`"
        class="zone"
        :class="[`zone-${zone}`, zoneClassname(`split:${node.id}:${zone}`)]"
        @dragenter.prevent="emit('dropZoneEnter', `split:${node.id}:${zone}`)"
        @dragover.prevent="emit('dropZoneEnter', `split:${node.id}:${zone}`)"
        @dragleave.prevent="emit('dropZoneLeave')"
        @drop.prevent="handleDrop($event, node.id, zone)"
      />
    </div>

    <div
      v-if="draggedPanelId"
      class="split-lane-zones"
    >
      <template v-if="node.direction === 'horizontal'">
        <div
          v-for="{ child, idx } in splitChildrenWithIndex(node)"
          :key="`lane-${node.id}-top-${child.id}`"
          class="lane-zone lane-zone-top"
          :class="zoneClassname(`lane:${child.id}:top`)"
          :style="laneStyle(idx, node.children.length, 'top')"
          @dragenter.prevent="emit('dropZoneEnter', `lane:${child.id}:top`)"
          @dragover.prevent="emit('dropZoneEnter', `lane:${child.id}:top`)"
          @dragleave.prevent="emit('dropZoneLeave')"
          @drop.prevent="handleDrop($event, child.id, 'top')"
        />
        <div
          v-for="{ child, idx } in splitChildrenWithIndex(node)"
          :key="`lane-${node.id}-bottom-${child.id}`"
          class="lane-zone lane-zone-bottom"
          :class="zoneClassname(`lane:${child.id}:bottom`)"
          :style="laneStyle(idx, node.children.length, 'bottom')"
          @dragenter.prevent="emit('dropZoneEnter', `lane:${child.id}:bottom`)"
          @dragover.prevent="emit('dropZoneEnter', `lane:${child.id}:bottom`)"
          @dragleave.prevent="emit('dropZoneLeave')"
          @drop.prevent="handleDrop($event, child.id, 'bottom')"
        />
      </template>

      <template v-else>
        <div
          v-for="{ child, idx } in splitChildrenWithIndex(node)"
          :key="`lane-${node.id}-left-${child.id}`"
          class="lane-zone lane-zone-left"
          :class="zoneClassname(`lane:${child.id}:left`)"
          :style="laneStyle(idx, node.children.length, 'left')"
          @dragenter.prevent="emit('dropZoneEnter', `lane:${child.id}:left`)"
          @dragover.prevent="emit('dropZoneEnter', `lane:${child.id}:left`)"
          @dragleave.prevent="emit('dropZoneLeave')"
          @drop.prevent="handleDrop($event, child.id, 'left')"
        />
        <div
          v-for="{ child, idx } in splitChildrenWithIndex(node)"
          :key="`lane-${node.id}-right-${child.id}`"
          class="lane-zone lane-zone-right"
          :class="zoneClassname(`lane:${child.id}:right`)"
          :style="laneStyle(idx, node.children.length, 'right')"
          @dragenter.prevent="emit('dropZoneEnter', `lane:${child.id}:right`)"
          @dragover.prevent="emit('dropZoneEnter', `lane:${child.id}:right`)"
          @dragleave.prevent="emit('dropZoneLeave')"
          @drop.prevent="handleDrop($event, child.id, 'right')"
        />
      </template>
    </div>
  </div>

  <div
    v-else
    class="dock-panel"
    @dragover.prevent
    @drop.prevent
  >
    <div
      class="dock-body"
      @dragstart.capture="onPanelBodyDragStartCapture"
      @dragend.capture="onPanelBodyDragEnd"
    >
      <slot :name="node.id" />
    </div>

    <div
      v-if="draggedPanelId && draggedPanelId !== node.id"
      class="panel-zones-overlay"
    >
      <div
        v-for="zone in ZONES"
        :key="`panel-${node.id}-${zone}`"
        class="zone"
        :class="[`zone-${zone}`, zoneClassname(`panel:${node.id}:${zone}`)]"
        @dragenter.prevent="emit('dropZoneEnter', `panel:${node.id}:${zone}`)"
        @dragover.prevent="emit('dropZoneEnter', `panel:${node.id}:${zone}`)"
        @dragleave.prevent="emit('dropZoneLeave')"
        @drop.prevent="handleDrop($event, node.id, zone)"
      />
    </div>
  </div>
</template>

<style scoped>
.dock-split-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.dock-split-root {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border-radius: 0;
  overflow: hidden;
}

.dock-child-fill {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.dock-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border-radius: 0;
  overflow: hidden;
}

.dock-body {
  position: relative;
  height: 100%;
  min-height: 0;
}

[data-dock-drag-handle="true"] {
  cursor: grab;
}

[data-dock-drag-handle="true"]:active {
  cursor: grabbing;
}

.split-zones-overlay,
.panel-zones-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 40;
}

.split-zones-overlay {
  z-index: 50;
}

.split-lane-zones {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 52;
}

.zone {
  position: absolute;
  pointer-events: auto;
  border: none;
  transition: all 100ms ease;
  width: 0;
  height: 0;
}

.zone-active {
  backdrop-filter: blur(2px);
  border: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
  background-color: rgba(147, 197, 253, 0.2);
}

.dark .zone-active {
  background-color: rgba(100, 116, 139, 0.2);
  border-color: var(--primary-dark-700, rgba(100, 116, 139, 0.5));
}

.panel-zones-overlay .zone-top.zone-active,
.split-zones-overlay .zone-top.zone-active {
  border-bottom: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.panel-zones-overlay .zone-bottom.zone-active,
.split-zones-overlay .zone-bottom.zone-active {
  border-top: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.panel-zones-overlay .zone-left.zone-active,
.split-zones-overlay .zone-left.zone-active {
  border-right: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.panel-zones-overlay .zone-right.zone-active,
.split-zones-overlay .zone-right.zone-active {
  border-left: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.lane-zone {
  position: absolute;
  pointer-events: auto;
  transition: all 100ms ease;
  border: none;
}

.lane-zone-top {
  top: 0;
  height: 32px;
}

.lane-zone-bottom {
  bottom: 0;
  height: 32px;
}

.lane-zone-left {
  left: 0;
  width: 32px;
}

.lane-zone-right {
  right: 0;
  width: 32px;
}

.lane-zone-top.zone-active {
  border-bottom: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.lane-zone-bottom.zone-active {
  border-top: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.lane-zone-left.zone-active {
  border-right: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.lane-zone-right.zone-active {
  border-left: 1px solid var(--amv-highlight, rgba(100, 100, 100, 0.3));
}

.panel-zones-overlay .zone-top {
  top: 0;
  width: 100%;
  height: 25%;
}

.panel-zones-overlay .zone-bottom {
  bottom: 0;
  width: 100%;
  height: 25%;
}

.panel-zones-overlay .zone-left {
  left: 0;
  width: 25%;
  height: 100%;
}

.panel-zones-overlay .zone-right {
  top: 0;
  right: 0;
  width: 25%;
  height: 100%;
}

.split-zones-overlay .zone-top {
  top: 0;
  left: 0;
  width: 100%;
  height: 28px;
}

.split-zones-overlay .zone-bottom {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 28px;
}

.split-zones-overlay .zone-left {
  top: 0;
  left: 0;
  width: 28px;
  height: 100%;
}

.split-zones-overlay .zone-right {
  top: 0;
  right: 0;
  width: 28px;
  height: 100%;
}

.dock-resize-trigger {
  position: relative;
  z-index: 10;
}

.dock-resize-indicator {
  position: absolute;
  inset: 0;
}
</style>
