<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useSettingsStore } from '@/composables/useSettingsStore';

const { settings, toggleLayout, toggleTheme } = useSettingsStore();
</script>

<template>
  <div>
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
      <div flex gap-2 text-neutral-500>
        <button toolbar-btn @click="toggleLayout">
          <div :class="settings.layout === 'vertical' ? 'i-mynaui:rectangle' : 'i-mynaui:rectangle-vertical'" />
        </button>
        <button
          toolbar-btn
          :title="`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`"
          @click="toggleTheme"
        >
          <div class="i-carbon:sun dark:i-carbon:moon" />
        </button>
      </div>
    </nav>

    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<style>

</style>
