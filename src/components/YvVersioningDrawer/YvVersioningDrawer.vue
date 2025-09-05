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
        <ul mb-32>
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
                px-4
                class="group/snapshot hover-bg-accent/60 dark:hover-bg-accent/10"
              >
                <div flex="~ items-center justify-between" mb-1>
                  <div flex gap-0 items-center>
                    <div
                      mt-0.5
                      transition="all duration-150 ease-in-out"
                      outline="0 offset-0 amber-600"
                      class="group-hover/snapshot:outline-1 group-hover/snapshot:outline-offset-2"
                      mr-2 size-2.5 rounded-full inline-block
                      bg-amber-600
                    />
                    <p text="sm amber-600" font-bold mr-2>
                      {{ snapshot.type }}
                    </p>
                    <p text="sm neutral-400 dark:neutral-500">
                      {{ Object.keys(snapshot.files).length }} files
                    </p>
                  </div>

                  <span
                    inline-block
                    text="xs neutral-400 dark:neutral-500"
                  >
                    {{ useTimeAgoIntl(snapshot.createdAt) }}
                  </span>
                </div>
                <div
                  relative flex="~ col gap-6"
                  border-l border-l-neutral-300 dark:border-l-neutral-600
                  class="`
                    before:content-['']
                    before:absolute
                    before:inset-y-0
                    before:-left-px
                    before:w-px
                    before:bg-amber-600
                    before:scale-y-0
                    before:origin-top
                    before:transition-transform
                    before:duration-300
                    group-hover/snapshot:before:scale-y-100
                  `"
                  pl-5 pb-3 ml-1
                >
                  <p font-bold class="text-foreground/70">
                    {{ snapshot.message }}
                  </p>

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
                            Confirm
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
