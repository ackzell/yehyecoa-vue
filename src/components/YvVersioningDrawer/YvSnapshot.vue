<script setup lang="ts">
import type { Snapshot, SnapshotType } from '@/db';
import { useTimeAgoIntl } from '@vueuse/core';
import { Menu } from 'floating-vue';
import { motion } from 'motion-v';
import { CodeDiff } from 'v-code-diff';
import { computed } from 'vue';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useSettingsStore } from '@/composables/useSettingsStore';
import Popover from '../ui/popover/Popover.vue';
import PopoverContent from '../ui/popover/PopoverContent.vue';
import PopoverTrigger from '../ui/popover/PopoverTrigger.vue';
import ScrollArea from '../ui/scroll-area/ScrollArea.vue';
import ScrollBar from '../ui/scroll-area/ScrollBar.vue';
import YvButton from './YvButton.vue';

type YVTimelineEntryProps = {
  snapshot: Snapshot;
};

type TypeColorConfig = {
  dot: string;
  line: string;
  text: string;
};

const props = defineProps<YVTimelineEntryProps>();

const fm = useFileManagerStore();
const { settings } = useSettingsStore();

const typeColors = computed((): TypeColorConfig => {
  const colorMap: Record<SnapshotType, TypeColorConfig> = {
    manual: {
      dot: 'bg-orange-700 outline-orange-700',
      line: 'before:bg-orange-700',
      text: 'text-orange-700',
    },
    periodic: {
      dot: 'bg-violet-700 outline-violet-700',
      line: 'before:bg-violet-700',
      text: 'text-violet-700',
    },
    auto: {
      dot: 'bg-pink-700 outline-pink-700',
      line: 'before:bg-pink-700',
      text: 'text-pink-700',
    },
  };

  return colorMap[props.snapshot.type as SnapshotType] || colorMap.manual;
});

function calculateFileCount(): number {
  return Object.keys(props.snapshot.files).filter(file => !['import-map.json', 'tsconfig.json'].includes(file)).length;
}

const didFilesChange = computed(() => {
  return fm.replStore.getFiles()['App.vue'] !== props.snapshot.files['App.vue'];
});
</script>

<template>
  <motion.li
    :initial="{ opacity: 0, scale: 0 }"
    :animate="{ opacity: 1, scale: 1 }"
    :exit="{ opacity: 0, scale: 0 }"
    px-4 layout
    class="group/snapshot hover-bg-accent/60 dark:hover-bg-accent/10"
  >
    <div flex="~ items-center justify-between" mb-1>
      <div flex gap-0 items-center>
        <div
          mt-0.5 mr-2 size-2.5 rounded-full
          transition="all duration-150 ease-in-out"
          outline="0 offset-0"
          class="group-hover/snapshot:outline-1 group-hover/snapshot:outline-offset-2"
          :class="[
            typeColors.dot,
            typeColors.line,
          ]"
        />
        <p text="sm" font-bold mr-2 :class="typeColors.text">
          {{ props.snapshot.type }}
        </p>
        <Menu v-if="didFilesChange" theme="diff-card" :arrow-overflow="true" arrow-padding="1rem">
          <p text="sm neutral-400 dark:neutral-500" cursor-pointer>
            {{
              calculateFileCount() === 1 ? '1 file' : `${calculateFileCount()} files`
            }}
          </p>

          <template #popper>
            <ScrollArea class="w-full whitespace-nowrap">
              <div
                p-2
                dark:bg-neutral-600
                bg-neutral-400
                max-w-screen-lg
              >
                <CodeDiff
                  :key="`${props.snapshot.id}-${Date.now()}`"
                  max-height="20rem"
                  :theme="settings.theme"
                  :old-string="fm.replStore.getFiles()['App.vue']"
                  :new-string="props.snapshot.files['App.vue']"
                  output-format="side-by-side"
                  filename="Current"
                  new-filename="Snapshot"
                />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </template>
        </Menu>
        <p v-else text="xs neutral-400 dark:neutral-500">
          (no changes)
        </p>
      </div>

      <span
        inline-block
        text="xs neutral-400 dark:neutral-500"
      >
        {{ useTimeAgoIntl(props.snapshot.createdAt) }}
      </span>
    </div>

    <div
      relative flex="~ col gap-6"
      border-l border-l-neutral-300 dark:border-l-neutral-600
      class="`
        before:content-['']
        before:absolute
        before:inset-y-0
        before:-left-px
        before:w-px
        before:scale-y-0
        before:origin-top
        before:transition-transform
        before:duration-300
        group-hover/snapshot:before:scale-y-100
      `"
      :class="typeColors.line"
      pl-5 pb-3 ml-1
    >
      <p font-bold class="text-foreground/70">
        {{ props.snapshot.message }}
      </p>

      <div h-full>
        <div flex gap-4 h-full>
          <YvButton
            class="hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
            dark="hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
            icon-class="i-carbon:rotate group-hover:-rotate-40"
            @click="fm.restoreSnapshot(props.snapshot)"
          >
            Restore
          </YvButton>
          <Popover>
            <PopoverTrigger>
              <YvButton
                class="bg-neutral-200/50 hover:bg-red-500/20 hover:text-red-800 active:bg-red-400/50 active:text-red-900"
                dark="bg-input/30 hover:bg-red-700/20 hover:text-red-400 active:bg-red-400/20 active:text-red-500"
                icon-class="i-carbon:trash-can"
                @click.shift.alt.prevent.stop="fm.deleteSnapshot(props.snapshot.id)"
              >
                Delete
              </YvButton>
            </PopoverTrigger>

            <PopoverContent w-auto>
              <YvButton
                class="bg-neutral-200/50 hover:bg-red-500/20 hover:text-red-800 active:bg-red-400/50 active:text-red-900"
                dark="bg-input/30 hover:bg-red-700/20 hover:text-red-400 active:bg-red-400/20 active:text-red-500"
                @click="fm.deleteSnapshot(props.snapshot.id)"
              >
                Confirm
              </YvButton>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  </motion.li>
</template>

<style>
.code-diff-view {
  margin: 0 !important;
}

.code-diff-view .diff-stat {
  flex-wrap: wrap;
  justify-content: flex-end !important;
}

.code-diff-view .info-right > span,
.code-diff-view .info-right > span.diff-command-bar {
  padding: 0.25rem !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.v-popper--theme-diff-card .v-popper__inner {
  border-color: var(--colors-neutral-800);
}

.v-popper--theme-diff-card .v-popper__arrow-outer {
  border-color: var(--colors-neutral-400) !important;

}

.v-popper--theme-diff-card .v-popper__arrow-inner {
  border-color: var(--colors-neutral-400) !important;

}

.dark .v-popper--theme-diff-card .v-popper__inner {
  border: var(--colors-neutral-600);
}

.dark .v-popper--theme-diff-card .v-popper__arrow-outer {
  border-color: var(--colors-neutral-600);

}

.dark .v-popper--theme-diff-card .v-popper__arrow-inner {
  border-color: var(--colors-neutral-600);

}
</style>
