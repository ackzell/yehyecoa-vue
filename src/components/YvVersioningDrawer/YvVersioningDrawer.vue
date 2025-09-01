<script setup lang="ts">
import { useTimeAgoIntl } from '@vueuse/core';
import { Dropdown } from 'floating-vue';
import {
  DrawerContent,
  DrawerDescription,
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
    <DrawerHeader>
      <DrawerTitle>History</DrawerTitle>
      <DrawerDescription mb-4>
        <YvSessionSelector />
      </DrawerDescription>
    </DrawerHeader>
    <div h-full px-4>
      <div
        v-if="!fm.snapshotsList.length"
        h-full
        flex="~ grow-1 items-center justify-center"
      >
        No snapshots saved in this session
      </div>

      <ScrollArea v-else h-full>
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
                    hover:scale-110
                    rounded
                    class="group bg-neutral-200/50 hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
                    dark="bg-input/30 hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
                    text="xs muted-foreground" px-2 py-1
                    @click="fm.restoreSnapshot(snap)"
                  >
                    Restore
                    <span
                      class="transition-transform duration-200 group-hover:-rotate-40"
                      i-carbon:rotate
                      size-4e
                      inline-block align-middle
                    />
                  </button>
                  <Dropdown :container="false" theme="yv-dropdown">
                    <button
                      hover:scale-110 cursor-pointer
                      rounded
                      class="group bg-neutral-200/50 hover:bg-red-500/20 hover:text-red-800 active:bg-red-400/50 active:text-red-900"
                      dark="bg-input/30 hover:bg-red-700/20 hover:text-red-400 active:bg-red-400/20 active:text-red-500"
                      text="xs muted-foreground" px-2 py-1
                      @click.shift.alt.prevent.stop="fm.deleteSnapshot(snap.id)"
                    >
                      Delete
                      <span
                        class="transition-transform duration-200 group-hover:scale-115"
                        i-carbon:trash-can
                        size-4
                        inline-block align-middle
                      />
                    </button>

                    <template #popper>
                      <button
                        hover:scale-110 cursor-pointer
                        rounded dark:text-white
                        class="group bg-neutral-200/50 hover:bg-red-500/20 hover:text-red-800 active:bg-red-400/50 active:text-red-900"
                        dark="bg-input/30 hover:bg-red-700/20 hover:text-red-400 active:bg-red-400/20 active:text-red-500"
                        text="xs muted-foreground" px-2 py-1
                        @click="fm.deleteSnapshot(snap.id)"
                      >
                        Confirm
                      </button>
                    </template>
                  </Dropdown>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </ScrollArea>
    </div>
  </DrawerContent>
</template>

<style>
.v-popper--theme-yv-dropdown {
  box-shadow: var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);
}

.v-popper--theme-yv-dropdown .v-popper__inner {
  background: var(--background);
  padding: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}

.v-popper--theme-yv-dropdown .v-popper__wrapper .v-popper__arrow-outer {
  outline-color: color-mix(in srgb, var(--colors-ring) 50%, transparent);
}

.v-popper--theme-yv-dropdown .v-popper__wrapper .v-popper__arrow-inner {
  visibility: hidden;
}

.dark .v-popper--theme-yv-dropdown  .v-popper__inner {
  background: var(--background);
  border-color: var(--colors-muted-DEFAULT);
}

.dark .v-popper--theme-yv-dropdown .v-popper__arrow-outer {
  border-color: var(--colors-muted-DEFAULT)
}

.dark .v-popper--theme-yv-dropdown .v-popper__arrow-inner {
  border-color: var(--colors-muted-DEFAULT);
}
</style>
