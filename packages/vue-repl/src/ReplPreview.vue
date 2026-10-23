<script setup lang="ts">
import { computed, inject } from 'vue'
import Preview from './output/Preview.vue'
import { injectKeyProps } from './types'

const injected = inject(injectKeyProps)!
const ssr = computed(() => !!injected.ssr?.value)
</script>

<template>
  <Preview :show="true" :ssr="ssr" />
</template>
