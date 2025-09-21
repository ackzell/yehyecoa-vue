<script setup lang="ts">
import { usePartyKitStore } from '@/composables/usePartyKitStore';
import YvButton from './YvVersioningDrawer/YvButton.vue';

const pks = usePartyKitStore();
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="instructor-status">
      <div
        v-if="pks.isUserInstructor ? pks.isConnected : pks.isInstructorConnected"
        v-tooltip="pks.isUserInstructor ? 'Instructor mode' : 'Instructor is online.'"
        w-4.5 h-4.5
        :bg="pks.isUserInstructor ? 'pink-500' : 'sky-400'"
        i-ph-broadcast-fill
      />
      <div
        v-else
        v-tooltip="pks.isUserInstructor ? 'You are offline' : 'Instructor is offline.'"
        w-4.5 h-4.5
        class="bg-neutral/50"
        i-ph-broadcast
      />
    </div>

    <div class="user-status">
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
        <div v-tooltip="'Click to receive real time updates from the instructor'">
          Reconnect
        </div>
      </YvButton>
    </div>
  </div>
</template>

<style scoped>

</style>
