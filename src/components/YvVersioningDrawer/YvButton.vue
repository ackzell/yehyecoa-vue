<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

type YvButtonProps = {
  class?: HTMLAttributes['class'];
  iconClass?: string;
};

const props = defineProps<YvButtonProps>();
</script>

<template>
  <button
    :class="cn(`group rounded
    bg-neutral-200/50 dark:bg-input/30
    hover:scale-110
    text-xs text-muted-foreground
    px-2 py-1
    `, props.class)"
    text=""
  >
    <slot />
    <slot v-if="props.iconClass" name="icon">
      <span
        class="transition-transform duration-200 group-hover:scale-115"
        :class="props.iconClass"
        size-4e
        inline-block align-middle
      />
    </slot>
  </button>
</template>
