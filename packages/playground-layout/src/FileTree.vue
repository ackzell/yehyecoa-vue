<script setup lang="ts" generic="T extends { path: string; name: string; children?: T[] }">
import type { TreeNode } from './types'
import { ref, computed } from 'vue'

defineOptions({
  name: 'FileTree',
})

const props = withDefaults(defineProps<{
  nodes: T[]
  selectedPath?: string
  depth?: number
}>(), {
  depth: 0,
})

const emit = defineEmits<{
  select: [path: string]
}>()

// TODO: config default open from templates
const openDirs = ref<Set<string>>(new Set())

function isOpen(path: string) {
  return openDirs.value.has(path)
}

function toggleDir(path: string) {
  if (openDirs.value.has(path))
    openDirs.value.delete(path)
  else
    openDirs.value.add(path)
}

function handleClick(node: T) {
  if (node.children && node.children.length > 0) {
    toggleDir(node.path)
  } else {
    emit('select', node.path)
  }
}

const isSelected = (path: string) => props.selectedPath === path

function isDirectory(node: T) {
  return !!(node.children && node.children.length > 0)
}
</script>

<template>
  <ul class="file-tree" role="tree">
    <li
      v-for="node in nodes"
      :key="node.path"
      class="file-tree-item"
      role="treeitem"
      :aria-expanded="isDirectory(node) ? isOpen(node.path) : undefined"
      :aria-selected="isSelected(node.path)"
    >
      <button
        type="button"
        class="file-tree-button"
        :class="{ 'file-tree-button--selected': isSelected(node.path) }"
        :style="{ paddingLeft: `${0.25 + 0.75 * depth}rem` }"
        @click="handleClick(node)"
      >
        <span
          class="file-tree-caret"
          :class="{
            'file-tree-caret--open': isDirectory(node) && isOpen(node.path),
            'file-tree-caret--hidden': !isDirectory(node),
          }"
          aria-hidden="true"
        ></span>
        <span
          class="file-tree-icon"
          :class="isDirectory(node) ? 'file-tree-icon--dir' : 'file-tree-icon--file'"
          aria-hidden="true"
        ></span>
        <span class="file-tree-name">{{ node.name }}</span>
      </button>
      <div v-if="isDirectory(node) && isOpen(node.path)" class="file-tree-children">
        <FileTree
          :nodes="node.children!"
          :selected-path="selectedPath"
          :depth="depth + 1"
          @select="(p) => emit('select', p)"
        />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.file-tree {
  list-style: none;
  margin: 0;
  padding: 0;
}

.file-tree-item {
  margin: 0;
  padding: 0;
}

.file-tree-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  padding: 0.125rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  border-radius: 0.25rem;
}

.file-tree-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.file-tree-button--selected {
  background-color: rgba(59, 130, 246, 0.15);
  color: inherit;
  font-weight: 500;
}

.file-tree-caret {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  border-left: 0.375rem solid currentColor;
  border-top: 0.25rem solid transparent;
  border-bottom: 0.25rem solid transparent;
  transition: transform 150ms ease;
}

.file-tree-caret--open {
  transform: rotate(90deg);
}

.file-tree-caret--hidden {
  visibility: hidden;
}

.file-tree-icon {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.file-tree-icon--dir::before {
  content: '📁';
  font-size: 0.875rem;
}

.file-tree-icon--file::before {
  content: '📄';
  font-size: 0.875rem;
}

.file-tree-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-tree-children {
  margin: 0;
  padding: 0;
}
</style>
