<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner';
import { Toaster as Sonner, toast } from 'vue-sonner';

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    class="toaster group toast-clickable hover:shadow-lg"
    v-bind="props"
    :toast-options="{
      unstyled: true,
      classes: {
        error: 'sc-toast-base text-red-500  border-red-500/10',
        success: 'sc-toast-base text-green-500 border-green-500/10',
        warning: 'sc-toast-base text-amber-500 border-amber-500/10',
        info: 'sc-toast-base text-blue-500 border-blue-500/10',
        description: 'text-neutral dark:text-neutral-400/90!',
      },
      style: {
        '--z-index': 999999,
        'z-index': 'calc(var(--z-index) - var(--index))',
      },
    }"
    @click="toast.dismiss(props.id)"
  >
    {{ props.id }}
    <template #warning-icon>
      <span i-mynaui:danger-hexagon-solid text-amber-500 inline-block align-middle />
    </template>
    <template #error-icon>
      <span i-mynaui:x-hexagon-solid text-red-500 inline-block align-middle />
    </template>
    <template #success-icon>
      <span i-mynaui:check-hexagon-solid text-green-500 inline-block align-middle />
    </template>
    <template #info-icon>
      <span i-mynaui:info-hexagon-solid text-blue-500 inline-block align-middle />
    </template>
  </Sonner>
</template>

<style>
/* Add a class to force motion */
html [data-sonner-toast],
  [data-sonner-toast] > *,
  .sonner-loading-bar {
  transition: transform 200ms, opacity 200ms !important;
  animation: revert !important;
}

.toast-clickable {
  cursor: pointer;
  transition: opacity 200ms ease, transform 200ms ease;
  user-select: none;
}

.toast-clickable:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.toast-clickable:active {
  transform: scale(0.98);
}
</style>
