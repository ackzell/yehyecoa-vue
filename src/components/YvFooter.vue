<script setup lang="ts">
import YvWorkshopJoiner from './YvWorkshopJoiner.vue';

const version = import.meta.env.PACKAGE_VERSION;
</script>

<template>
  <div>
    <div
      flex="~ justify-between items-center"
      relative p-2 pr-6 z-40
      shadow-md
      bg="light dark:dark-900"
      border="b neutral-300/10"
      text="#333 dark:neutral-500"
      h="var(--footer-height)"
      transition="background-color 0.2s ease"
    >
      <div>
        <YvWorkshopJoiner />
        <slot name="begin" />
      </div>
      <div>
        <slot name="middle" />
      </div>
      <div>
        <slot name="end">
          <pre text="xs neutral/30" bg-transparent>yehyecoa-vue v{{ version }}</pre>
        </slot>
      </div>
    </div>
  </div>
</template>
