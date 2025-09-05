<script setup lang="ts">
import { useTimeAgoIntl } from '@vueuse/core';
import { AnimatePresence, LayoutGroup, motion } from 'motion-v';
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import Popover from '../ui/popover/Popover.vue';
import PopoverContent from '../ui/popover/PopoverContent.vue';
import PopoverTrigger from '../ui/popover/PopoverTrigger.vue';
import YvButton from './YvButton.vue';
import YvSessionSelector from './YvSessionSelector.vue';

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
    <div
      flex="~ col"
      h-full
    >
      <div
        v-if="!fm.snapshotsList.length"
        class="dark:bg-accent/10 bg-accent/40"
        flex="~ grow items-center justify-center"
        h-full
      >
        No snapshots saved in this session
      </div>

      <ScrollArea v-else flex="~ grow-1" h-full>
        <ul mb-32 p-2>
          <LayoutGroup>
            <AnimatePresence>
              <motion.li
                v-for="(snapshot) in fm.snapshotsList"
                :key="snapshot.id"
                layout
                :initial="{
                  opacity: 0,
                  x: 100,
                }"
                :animate="{
                  opacity: 1,
                  x: 0,
                }"
                :exit="{
                  opacity: 0,
                  x: 250,
                }"
              >
                <div flex="~ items-center justify-between">
                  <div flex gap-2>
                    <span
                      inline-block
                      text="sm amber-700"
                      font="bold"
                    >
                      <span
                        mr-2
                        size-2 rounded-full
                        inline-block
                        bg-amber-700
                      />
                      {{ snapshot.type }}
                    </span>
                    <span inline-block text="sm neutral-400 dark:neutral-500">
                      {{ Object.keys(snapshot.files).length }} files
                    </span>
                  </div>

                  <span
                    p-1
                    inline-block
                    text="xs neutral-400 dark:neutral-500"
                  >
                    {{ useTimeAgoIntl(snapshot.createdAt) }}
                  </span>
                </div>
                <div
                  border-l border-l-neutral-300 dark:border-l-neutral-600 pl-5
                  pb-3
                  ml-0.9
                  flex="~ col gap-6"
                >
                  <div font-bold>
                    {{ snapshot.message }}
                  </div>

                  <div h-full>
                    <div flex gap-4 h-full>
                      <YvButton
                        class="hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
                        dark="hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
                        icon-class="i-carbon:rotate group-hover:-rotate-40"
                        @click="fm.restoreSnapshot(snapshot)"
                      >
                        Restore
                      </YvButton>
                      <Popover>
                        <PopoverTrigger>
                          <YvButton
                            class="bg-neutral-200/50 hover:bg-red-500/20 hover:text-red-800 active:bg-red-400/50 active:text-red-900"
                            dark="bg-input/30 hover:bg-red-700/20 hover:text-red-400 active:bg-red-400/20 active:text-red-500"
                            icon-class="i-carbon:trash-can"
                            @click.shift.alt.prevent.stop="fm.deleteSnapshot(snapshot.id)"
                          >
                            Delete
                          </YvButton>
                        </PopoverTrigger>

                        <PopoverContent w-auto>
                          <YvButton
                            class="bg-neutral-200/50 hover:bg-red-500/20 hover:text-red-800 active:bg-red-400/50 active:text-red-900"
                            dark="bg-input/30 hover:bg-red-700/20 hover:text-red-400 active:bg-red-400/20 active:text-red-500"
                            @click="fm.deleteSnapshot(snapshot.id)"
                          >
                            Delete
                          </YvButton>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </motion.li>
            </AnimatePresence>
          </LayoutGroup>
        </ul>
      </ScrollArea>
    </div>
  </DrawerContent>
</template>
