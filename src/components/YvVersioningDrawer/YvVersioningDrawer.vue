<script setup lang="ts">
import { useTimeAgoIntl } from '@vueuse/core';
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import YvSessionSelector from './YvSessionSelector.vue';

const fm = useFileManagerStore();
</script>

<template>
  <DrawerContent
    class="border focus-outline-none border-l-neutral-300 dark:border-l-neutral-800"
    @open-auto-focus="(e) => (e.target as HTMLElement).focus()"
  >
    <DrawerHeader h-full>
      <DrawerTitle>History</DrawerTitle>
      <DrawerDescription mb-4>
        <YvSessionSelector />
      </DrawerDescription>

      <div h-full>
        <div
          v-if="!fm.snapshotsList.length"
          h-full
          flex="~ grow-1 items-center justify-center"
        >
          No snapshots saved in this session
        </div>

        <ScrollArea v-else>
          <ul flex flex-col>
            <li
              v-for="(snap) in fm.snapshotsList" :key="snap.id"
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
                    {{ snap.type }}
                  </span>
                  <span inline-block text="sm neutral-400 dark:neutral-500">
                    {{ Object.keys(snap.files).length }} files
                  </span>
                </div>

                <span
                  p-1
                  inline-block
                  text="xs neutral-400 dark:neutral-500"
                >
                  {{ useTimeAgoIntl(snap.createdAt) }}
                </span>
              </div>
              <div
                border-l border-l-neutral-300 dark:border-l-neutral-600 pl-5
                pb-3
                ml-0.9
                flex="~ col gap-6"
              >
                <div font-bold>
                  {{ snap.message }}
                </div>

                <div h-full>
                  <div flex gap-4 h-full>
                    <button
                      rounded
                      class="bg-neutral-200/50 hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
                      dark="bg-neutral-500/20 hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
                      text-xs px-2 py-1
                      @click="fm.restoreSnapshot(snap)"
                    >
                      Restore
                      <span
                        i-carbon:rotate
                        size-4e
                        inline-block align-middle
                      />
                    </button>
                    <button
                      rounded
                      class="bg-neutral-200/50 hover:bg-red-500/20 hover:text-red-800 active:bg-red-400/50 active:text-red-900"
                      dark="bg-neutral-500/20 hover:bg-red-700/20 hover:text-red-400 active:bg-red-400/20 active:text-red-500"
                      text-xs px-2 py-1

                      @click="fm.deleteSnapshot(snap.id)"
                    >
                      Delete
                      <span
                        i-carbon:trash-can
                        size-4
                        inline-block align-middle
                      />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </ScrollArea>
      </div>
    </DrawerHeader>
    <DrawerFooter>
      <DrawerClose>
        <button btn-outline w-full>
          Close
        </button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</template>

<style scoped>
</style>
