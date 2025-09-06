<script setup lang="ts">
import { AnimatePresence, LayoutGroup, motion } from 'motion-v';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import ScrollArea from '../ui/scroll-area/ScrollArea.vue';
import YvSessionSelector from '../YvVersioningDrawer/YvSessionSelector.vue';
import YvSnapshot from '../YvVersioningDrawer/YvSnapshot.vue';

const fm = useFileManagerStore();
</script>

<template>
  <div class="sidebar-container">
    <div class="main-content">
      <slot />
    </div>

    <motion.div
      :animate="{
        width: fm.isDrawerOpen ? '350px' : '0px',
      }"
      :transition="{
        duration: 0.3,
        ease: 'easeInOut',
      }"
      bg="light-100 dark:dark-900"
      border="l  neutral-200 dark:neutral-800"
      flex flex-col
    >
      <motion.div
        v-if="fm.isDrawerOpen"
        :initial="{ opacity: 0, x: 30 }"
        :animate="{ opacity: 1, x: 0 }"
        :exit="{ opacity: 0, x: 30 }"
        :transition="{
          duration: 0.25,
          delay: 0.15,
          ease: 'easeOut',
        }"
      >
        <div p-4 shadow-md bg="background dark:dark-900">
          <YvSessionSelector />
        </div>

        <div flex="~ grow" class="sidebar-content">
          <div
            v-if="!fm.snapshotsList.length"
            class="dark:bg-accent/10 bg-accent/40"
            flex="~ grow-1 items-center justify-center"
          >
            No snapshots saved in this session
          </div>

          <ScrollArea v-else flex="~ grow-1" h-full>
            <ul mb-8>
              <LayoutGroup>
                <AnimatePresence mode="popLayout">
                  <YvSnapshot
                    v-for="(snapshot) in fm.snapshotsList"
                    :key="snapshot.id"
                    :snapshot="snapshot"
                  />
                </AnimatePresence>
              </LayoutGroup>
            </ul>
          </ScrollArea>
        </div>
      </motion.div>
    </motion.div>
  </div>
</template>

<style>
.sidebar-container {
  display: grid;
  grid-template-columns: 1fr auto;
  height: calc(var(--vh) - var(--nav-height) - var(--footer-height)) !important;
}

.main-content {
  overflow: hidden;
  min-width: 0;
}

.sidebar-content {
  height: calc(var(--vh) - var(--nav-height) - 70px - var(--footer-height)) !important;
}
</style>
