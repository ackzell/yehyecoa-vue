<script setup lang="ts">
import { AnimatePresence, LayoutGroup } from 'motion-v';
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileManagerStore } from '@/composables/useFileManagerStore';

import YvSessionSelector from './YvSessionSelector.vue';
import YvSnapshot from './YvSnapshot.vue';

const fm = useFileManagerStore();
</script>

<template>
  <DrawerContent
    class="border focus-outline-none border-l-neutral-300 dark:border-l-neutral-800"
    @open-auto-focus="(e) => (e.target as HTMLElement).focus()"
  >
    <DrawerHeader>
      <DrawerTitle>History</DrawerTitle>
      <DrawerDescription mb-4>
        <YvSessionSelector />
      </DrawerDescription>
    </DrawerHeader>
    <div flex flex-col h-full>
      <div
        v-if="!fm.snapshotsList.length"
        class="dark:bg-accent/10 bg-accent/40"
        flex="~ grow items-center justify-center"
        h-full
      >
        No snapshots saved in this session
      </div>

      <ScrollArea v-else flex="~ grow-1" h-full>
        <ul mb-32>
          <LayoutGroup>
            <AnimatePresence>
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
  </DrawerContent>
</template>
