<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import { ref } from 'vue';
import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import { useSettingsStore } from '@/composables/useSettingsStore';

const {
  settings,
  toggleLayout,
  toggleOutput,
  toggleConsole,
  toggleOutputLayout,
} = useSettingsStore();

const isLayoutPopoverOpen = ref(false);

const groupVariants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
  leave: {
    opacity: 0,
    y: 16,
    transition: { staggerChildren: 0.06, delayChildren: 0.05, staggerDirection: -1 },
  },
};
const itemVariants = {
  initial: { opacity: 0, y: 0 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
};
</script>

<template>
  <Popover v-model:open="isLayoutPopoverOpen">
    <PopoverTrigger>
      <button
        v-tooltip.bottom="`Layout`"
        class="sc-toolbar-btn"
      >
        <div
          class="cursor-pointer i-mynaui:layout hover:i-mynaui:layout-solid"
          :class="isLayoutPopoverOpen
            ? 'i-mynaui:layout-solid'
            : 'i-mynaui:layout'"
        />
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-auto">
      <AnimatePresence>
        <motion.div
          v-if="isLayoutPopoverOpen"
          role="menu"
          tabindex="0"
          flex flex-col gap-3 text-neutral-500
          :variants="groupVariants"
          initial="initial"
          animate="enter"
          exit="leave"
        >
          <motion.div :variants="itemVariants">
            <button
              v-tooltip.left-start="`${settings.showOutput ? 'Hide' : 'Show'} preview`"
              class="sc-toolbar-btn"

              @click.prevent="toggleOutput"
            >
              <div
                class="hover:i-mynaui-desktop-solid"
                :class="settings.showOutput
                  ? 'i-mynaui-desktop-solid'
                  : 'i-mynaui-desktop'"
              />
            </button>
          </motion.div>

          <motion.div :variants="itemVariants">
            <button
              v-tooltip.left-start="`Switch to ${settings.layout === 'vertical' ? 'horizontal' : 'vertical'} layout`"
              class="sc-toolbar-btn"
              :disabled="!settings.showOutput"
              @click="toggleLayout"
            >
              <div
                :class="settings.layout === 'vertical'
                  ? 'i-mynaui:rectangle hover:i-mynaui:rectangle-solid'
                  : 'i-mynaui:rectangle-vertical hover:i-mynaui:rectangle-vertical-solid'"
              />
            </button>
          </motion.div>

          <motion.div :variants="itemVariants">
            <button
              v-tooltip.left-start="`${settings.layoutReverse ? 'Normal' : 'Reverse'} layout`"
              class="sc-toolbar-btn"
              :disabled="!settings.showOutput"
              @click="settings.layoutReverse = !settings.layoutReverse"
            >
              <motion.div
                :key="settings.layout"
                :variants="itemVariants"
                class="transition-all duration-200"
                :class="settings.layout === 'horizontal'
                  ? 'i-mynaui-arrow-left-right hover:i-mynaui-arrow-left-right-solid'
                  : 'i-mynaui-arrow-up-down hover:i-mynaui-arrow-up-down-solid'"
              />
            </button>
          </motion.div>

          <motion.div :variants="itemVariants">
            <button
              v-tooltip.left-start="`${settings.showConsole ? 'Hide' : 'Show'} console`"
              class="sc-toolbar-btn"
              :disabled="!settings.showOutput"

              @click="toggleConsole"
            >
              <div
                class="hover:i-mynaui-terminal-solid"
                :class="settings.showConsole
                  ? 'i-mynaui-terminal-solid'
                  : 'i-mynaui-terminal'"
              />
            </button>
          </motion.div>
          <motion.div :variants="itemVariants">
            <button
              v-tooltip.left-start="`Switch to ${settings.outputLayout === 'vertical' ? 'horizontal' : 'vertical'} output layout`"
              :disabled="!settings.showConsole || !settings.showOutput"
              class="sc-toolbar-btn"

              @click="toggleOutputLayout"
            >
              <div
                class="hover:i-mynaui-square-half-solid"
                :class="settings.outputLayout === 'vertical'
                  ? 'i-mynaui-square-half rotate-90'
                  : 'i-mynaui-square-half'"
              />
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </PopoverContent>
  </Popover>
</template>
