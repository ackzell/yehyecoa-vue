<script setup lang="ts">
import { usePartyKitBroadcast } from '@/composables/usePartyKit';

const version = import.meta.env.PACKAGE_VERSION;

const pkb = usePartyKitBroadcast();
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
          <div flex="~ items-center gap-1">
            <div
              v-if="pkb.isInstructorConnected.value"
              flex items-center gap-1
              px-1 rounded cursor-default
              text="xs blue-500/80"
              bg="blue-600/7"
            >
              <div
                class="animate-pulse"
                w-1.5 h-1.5 rounded-full
                bg-blue-500
              />
              <div>
                <strong>Instructor online</strong>
              </div>
            </div>

            <div
              v-else
              flex items-center gap-1
              px-1 rounded cursor-default
              text="xs neutral/80"
              bg="neutral/10"
              dark="text-neutral-600 border-neutral/40"
            >
              <!-- <div
                v-tooltip="pkb.isWorkshopActive.value
                  ? `Workshop will end in ${pkb.offlineInstructorTimeLeft.value / 60} minutes if they don\'t return`
                  : 'No active workshop.'"
              >
                Instructor offline
              </div> -->

              <div>
                Instructor offline
              </div>
            </div>

            <!-- <button
              v-if="pkb.isWorkshopActive.value && pkb.isConnected.value"
              flex items-center gap-1
              px-1 rounded cursor-pointer
              text="xs teal-500/80"
              bg="teal-600/7"
              @click="pkb.disconnect()"
            > -->
            <button
              v-if=" pkb.isConnected.value"
              flex items-center gap-1
              px-1 rounded cursor-pointer
              text="xs teal-500/80"
              bg="teal-600/7"
              @click="pkb.disconnect()"
            >
              <div
                class="animate-pulse"
                w-1.5 h-1.5 rounded-full
                bg-teal-500
              />
              <div v-tooltip="'Click to disconnect'">
                <strong>{{ pkb.currentRoomId.value }}</strong>
              </div>
            </button>

            <!-- <button
              v-else
              flex items-center gap-1
              px-1 rounded cursor-pointer
              text="xs neutral/80"
              bg="neutral/10"
              dark="text-neutral-600 border-neutral/40"
              @click="pkb.isWorkshopActive.value && pkb.reconnect()"
            > -->
            <button
              v-else
              flex items-center gap-1
              px-1 rounded cursor-pointer
              text="xs neutral/80"
              bg="neutral/10"
              dark="text-neutral-600 border-neutral/40"
              @click="pkb.reconnect()"
            >
              <!-- <div v-tooltip="pkb.isWorkshopActive.value ? 'Click to try reconnecting' : 'No active workshop.'">
                Disconnected
              </div> -- -->

              <div v-tooltip="'Click to try reconnecting'">
                Disconnected
              </div>
            </button>
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
