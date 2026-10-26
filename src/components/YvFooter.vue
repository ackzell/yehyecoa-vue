<script setup lang="ts">
import { ref } from 'vue';
import YvChangelogSheet from '@/components/YvChangelogSheet.vue';
import { isCollabEnabled } from '@/composables/usePartyKitStore';
import YvWorkshopJoiner from './YvWorkshopJoiner.vue';

const version = import.meta.env.PACKAGE_VERSION;
const isChangelogOpen = ref(false);
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
        <YvWorkshopJoiner v-if="isCollabEnabled" />
        <slot name="begin" />
      </div>
      <div>
        <slot name="middle" />
      </div>
      <div>
        <slot name="end">
          <button
            type="button"
            title="View changelog"
            class="cursor-pointer bg-transparent font-mono text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
            @click="isChangelogOpen = true"
          >
            yehyecoa-vue v{{ version }}
          </button>
        </slot>
      </div>
    </div>

    <YvChangelogSheet v-model:open="isChangelogOpen" />
  </div>
</template>
