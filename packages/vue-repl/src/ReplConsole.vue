<script setup lang="ts">
import { computed, inject } from 'vue'
import { injectKeyProps } from './types'

const injected = inject(injectKeyProps)!
const consoleComponent = computed(() => injected.console.value)
</script>

<template>
  <component :is="consoleComponent" />
</template>
