<script setup lang="ts">
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
          <PopoverContent w-auto>
            <div flex flex-col gap-3 text-neutral-500>
              <button
                v-tooltip.left-start="`Switch to ${settings.layout === 'vertical' ? 'horizontal' : 'vertical'} layout`"
                sc-toolbar-btn
                @click="toggleLayout"
              >
                <div
                  :class="settings.layout === 'vertical'
                    ? 'i-mynaui:rectangle hover:i-mynaui:rectangle-solid'
                    : 'i-mynaui:rectangle-vertical hover:i-mynaui:rectangle-vertical-solid'"
                />
              </button>

              <button
                v-tooltip.left-start="`${settings.showOutput ? 'Hide' : 'Show'} preview`"
                sc-toolbar-btn
                @click="toggleOutput"
              >
                <div
                  class="hover:i-mynaui-desktop-solid"
                  :class="settings.showOutput
                    ? 'i-mynaui-desktop-solid'
                    : 'i-mynaui-desktop'"
                />
              </button>

              <button
                v-tooltip.left-start="`${settings.showConsole ? 'Hide' : 'Show'} console`"
                sc-toolbar-btn
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

              <button
                v-tooltip.left-start="`Switch to ${settings.outputLayout === 'vertical' ? 'horizontal' : 'vertical'} output layout`"
                :disabled="!settings.showConsole || !settings.showOutput"
                sc-toolbar-btn
                @click="toggleOutputLayout"
              >
                <div
                  class="hover:i-mynaui-square-half-solid"
                  :class="settings.outputLayout === 'vertical'
                    ? 'i-mynaui-square-half rotate-90'
                    : 'i-mynaui-square-half'"
                />
              </button>
            </div>
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
