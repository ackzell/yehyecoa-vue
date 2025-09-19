<script setup lang="ts">
import { usePartyKitStore } from '@/composables/usePartyKitStore';
import YvButton from './YvVersioningDrawer/YvButton.vue';

const version = import.meta.env.PACKAGE_VERSION;

const pks = usePartyKitStore();
</script>

<template>
  <div>
    <div
      flex="~ justify-between items-center"
      relative p-2 pr-6 z-999
      shadow-md
      bg="light dark:dark-900"
      border="b neutral-300/10"
      text="#333 dark:neutral-500"
      h="var(--footer-height)"
      transition="background-color 0.2s ease"
    >
      <div>
        <slot name="begin">
          <div flex="~ items-center gap-2">
            <div>
              <div
                v-if="pks.isInstructorConnected"
                v-tooltip="pks.isUserInstructor ? 'Instructor mode' : 'Instructor is online.'"
                w-3.5 h-3.5
                :bg="pks.isUserInstructor ? 'pink-500' : 'sky-400'"
                i-carbon-user-filled
              />
              <div
                v-else
                v-tooltip="'Instructor is offline.'"
                w-3.5 h-3.5
                class="bg-neutral/50"
                i-carbon-user
              />
            </div>

            <YvButton
              v-if="pks.isConnected"
              class="hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
              dark="hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
              @click="pks.disconnect()"
            >
              <div flex="~ items-center gap-1">
                <div
                  class="animate-pulse"
                  w-1.5 h-1.5 rounded-full
                  bg-emerald-500
                />
                <div v-tooltip="'Click to disconnect'">
                  {{ pks.currentRoomId }}
                </div>
              </div>
            </YvButton>

            <!-- <button
              v-else
              flex items-center gap-1
              px-1 rounded cursor-pointer
              text="xs neutral/80"
              bg="neutral/10"
              dark="text-neutral-600 border-neutral/40"
              @click="pkb.isWorkshopActive.value && pkb.reconnect()"
            > -->
            <YvButton
              v-else
              class="hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
              dark="hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
              flex items-center gap-1
              px-1 rounded cursor-pointer
              text="xs neutral/80"
              bg="neutral/10"
              @click="pks.reconnect()"
            >
              <!-- <div v-tooltip="pkb.isWorkshopActive.value ? 'Click to try reconnecting' : 'No active workshop.'">
                Disconnected
              </div> -- -->

              <div v-tooltip="'Click to receive real time updates from the instructor'">
                Reconnect
              </div>
            </YvButton>
          </div>
        </slot>
      </div>
      <div>
        <slot name="middle" />
      </div>
      <div>
        <slot name="end">
          <pre text="xs neutral/30" bg-transparent>yehyecoa-vue v{{ version }}</pre>
        </slot>
      </div>
    </div>
  </div>
</template>
