<script setup lang="ts">
const version = import.meta.env.PACKAGE_VERSION;
</script>

<template>
  <div>
    <div
      flex="~ justify-between items-center"
      relative p-2 pr-6 z-999
      shadow-md
      bg="light dark:dark-900"
      border="b neutral-300/10"
      text="#333 dark:neutral-500"
      h="var(--footer-height)"
      transition="background-color 0.2s ease"
    >
      <div>
        <slot name="begin">
        <!-- <p text="xs ">
          {{ new Date().toLocaleString() }}
        </p> -->
        </slot>
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
