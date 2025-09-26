<script setup lang="ts">
import YvOnlineStatus from '@/components/YvOnlineStatus.vue';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { useSettingsStore } from '@/composables/useSettingsStore';
import YvLayoutMenu from './YvLayoutMenu.vue';

const {
  settings,
  toggleTheme,
} = useSettingsStore();

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

        <YvLayoutMenu />

        <button
          v-tooltip.bottom-end="`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`"
          class="sc-toolbar-btn"
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
