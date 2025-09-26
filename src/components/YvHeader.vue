<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import { ref } from 'vue';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useSettingsStore } from '@/composables/useSettingsStore';

import Popover from './ui/popover/Popover.vue';
import PopoverContent from './ui/popover/PopoverContent.vue';
import PopoverTrigger from './ui/popover/PopoverTrigger.vue';
import YvOnlineStatus from './YvOnlineStatus.vue';

const {
  settings,
  toggleLayout,
  toggleTheme,
  toggleOutput,
  toggleConsole,
  toggleOutputLayout,
} = useSettingsStore();

const isLayoutPopoverOpen = ref(false);

const fm = useFileManagerStore();

const groupVariants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
  leave: {
    opacity: 0,
    y: 16,
    transition: { staggerChildren: 0.08, delayChildren: 0.05, staggerDirection: -1 },
  },
};
const itemVariants = {
  initial: { opacity: 0, y: 0 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
};
</script>

<template>
  <div>
    <nav
      flex="~ justify-between"
      relative p-4 pr-6 z-40
      shadow-md
      bg="light dark:dark-900"
      border="b neutral-300/10"
      text="#333 dark:neutral-300"
      h="var(--nav-height)"
      transition="background-color 0.2s ease"
    >
      <h1 text-md font-500 inline-flex items-center>
        <!-- TODO: maybe a logo would be cool -->
        <!-- <img alt="logo" src="/logo.svg" /> -->
        <!-- <span>yehyecoa-vue</span> -->
        <!-- yehyecoa-vue -->
      </h1>

      <!-- true center -->
      <div
        absolute w-max
        class="-translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
      >
        <YvOnlineStatus />
      </div>

      <div flex gap-4 text-neutral-500>
        <button
          v-tooltip.bottom="'Save snapshot'"
          class="sc-toolbar-btn"
          @click="fm.saveSnapshot({ type: 'manual', message: 'Manually saved' })"
        >
          <div class="i-mynaui:save hover:i-mynaui:save-solid" />
        </button>

        <button
          v-tooltip.bottom="`${fm.isDrawerOpen ? 'Close' : 'Open'} history`"
          class="sc-toolbar-btn"
          @click="fm.isDrawerOpen = !fm.isDrawerOpen"
        >
          <div class="i-mynaui:clock-hexagon hover:i-mynaui:clock-hexagon-solid" :class="fm.isDrawerOpen ? 'i-mynaui:clock-hexagon-solid' : 'i-mynaui:clock-hexagon'" />
        </button>

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

        <button
          v-tooltip.bottom-end="`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`"
          sc-toolbar-btn
          @click="toggleTheme"
        >
          <div class="i-mynaui:sun hover:i-mynaui:sun-solid dark:i-mynaui:moon dark:hover:i-mynaui:moon-solid" />
        </button>
      </div>
    </nav>
  </div>
</template>

  <style>

  </style>
