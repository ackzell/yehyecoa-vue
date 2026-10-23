<script setup lang="ts">
import { inject } from 'vue'
import EditorContainer from './editor/EditorContainer.vue'
import { injectKeyProps } from './types'

const injected = inject(injectKeyProps)!
const editorComponent = injected.editor
</script>

<template>
  <EditorContainer :editor-component="editorComponent" />
</template>
