<script setup lang="ts">
import { computed, inject, useTemplateRef } from 'vue'
import Preview from './output/Preview.vue'
import { injectKeyProps } from './types'

const props = withDefaults(defineProps<{ show?: boolean }>(), {
  show: true,
})

const injected = inject(injectKeyProps)!
const ssr = computed(() => !!injected.ssr?.value)

const previewRef = useTemplateRef('preview')

defineExpose({
  reload: () => previewRef.value?.reload(),
})
</script>

<template>
  <Preview ref="preview" :show="props.show" :ssr="ssr" />
</template>
