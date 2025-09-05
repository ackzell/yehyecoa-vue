<script setup lang="ts">
import {
  Drawer,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useSettingsStore } from '@/composables/useSettingsStore';
import YvVersioningDrawer from './YvVersioningDrawer/YvVersioningDrawer.vue';

const { settings, toggleLayout, toggleTheme } = useSettingsStore();

const fm = useFileManagerStore();
</script>

<template>
  <div>
    <Drawer v-model:open="fm.isDrawerOpen" :default-open="true" direction="right">
      <nav
        flex="~ justify-between"
        relative p-4 pr-6 z-999
        shadow-md
        bg="light dark:dark-900"
        border="b neutral-300/10"
        text="#333 dark:neutral-300"
        h="var(--nav-height)"
        transition="background-color 0.2s ease"
      >
        <h1 text-lg font-500 inline-flex items-center>
          <!-- TODO: maybe a logo would be cool -->
          <!-- <img alt="logo" src="/logo.svg" /> -->
          <span>yehyecoa-vue</span>
        </h1>
        <!-- <div>
            submenus here
          </div> -->
        <div flex gap-4 text-neutral-500>
          <button
            v-tooltip.bottom="'Save snapshot'"
            class="sc-toolbar-btn"
            @click="fm.saveSnapshot({ type: 'manual', message: 'Manually saved' })"
          >
            <div class="i-mynaui:save hover:i-mynaui:save-solid" />
          </button>

          <DrawerTrigger>
            <button v-tooltip.bottom="'Open history'" class="sc-toolbar-btn">
              <div class="i-mynaui:clock-hexagon hover:i-mynaui:clock-hexagon-solid" />
            </button>
          </DrawerTrigger>

          <button v-tooltip.bottom-end="`Switch to ${settings.layout === 'vertical' ? 'horizontal' : 'vertical'} layout`" sc-toolbar-btn @click="toggleLayout">
            <div :class="settings.layout === 'vertical' ? 'i-mynaui:rectangle hover:i-mynaui:rectangle-solid' : 'i-mynaui:rectangle-vertical hover:i-mynaui:rectangle-vertical-solid'" />
          </button>

          <button
            v-tooltip.bottom-end="`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`"
            sc-toolbar-btn
            @click="toggleTheme"
          >
            <div class="i-mynaui:sun hover:i-mynaui:sun-solid dark:i-mynaui:moon dark:hover:i-mynaui:moon-solid" />
          </button>
        </div>
      </nav>

      <YvVersioningDrawer />
    </Drawer>
  </div>
</template>

  <style>

  </style>
