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
        relative p-4 z-999 shadow-md
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
            class="toolbar-btn"
            @click="fm.saveSnapshot()"
          >
            <div class="i-mynaui:save" />
          </button>

          <DrawerTrigger>
            <button v-tooltip.bottom="'Open history'" class="toolbar-btn">
              <div class="i-carbon:data-backup" />
            </button>
          </DrawerTrigger>

          <button v-tooltip.bottom="`Switch to ${settings.layout === 'vertical' ? 'horizontal' : 'vertical'} layout`" toolbar-btn @click="toggleLayout">
            <div :class="settings.layout === 'vertical' ? 'i-mynaui:rectangle' : 'i-mynaui:rectangle-vertical'" />
          </button>

          <button
            v-tooltip.bottom="`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`"
            toolbar-btn
            @click="toggleTheme"
          >
            <div class="i-carbon:sun dark:i-carbon:moon" />
          </button>
        </div>
      </nav>

      <YvVersioningDrawer />
    </Drawer>
  </div>
</template>

  <style>

  </style>
