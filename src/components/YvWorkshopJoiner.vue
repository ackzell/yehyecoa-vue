<script setup lang="ts">
import { usePartyKitStore } from '@/composables/usePartyKitStore';
import Popover from './ui/popover/Popover.vue';
import PopoverContent from './ui/popover/PopoverContent.vue';
import PopoverTrigger from './ui/popover/PopoverTrigger.vue';
import YvButton from './YvVersioningDrawer/YvButton.vue';

const pks = usePartyKitStore();
</script>

<template>
  <div>
    <Popover v-if="pks.isConnected">
      <div flex="~ items-center gap-1">
        <PopoverTrigger>
          <button
            v-tooltip.right="'Leave workshop'"
            class="flex items-center sc-toolbar-btn"
          >
            <span
              inline-block
              w-3.5 h-3.5
              bg-emerald-500
              i-ph-broadcast-fill
            />
          </button>
        </PopoverTrigger>
        <div text="xs emerald-500/60">
          {{ pks.currentRoomId }}
        </div>
      </div>

      <PopoverContent w-auto>
        <YvButton
          class="hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
          dark="hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
          @click="pks.disconnect()"
        >
          <span>Leave</span>
        </YvButton>
      </PopoverContent>
    </Popover>

    <Popover v-else>
      <div flex="~ items-center gap-1">
        <PopoverTrigger>
          <button
            v-if="!pks.isConnected"
            v-tooltip.right="'Check for workshops'"
            class="flex items-center sc-toolbar-btn"
            @click="pks.checkForAvailableWorkshop()"
          >
            <span
              inline-block
              w-3.5 h-3.5
              i-ph-broadcast-fill
            />
          </button>
        </PopoverTrigger>
      </div>

      <PopoverContent w-auto>
        <div v-if="!pks.isConnected && pks.isWorkshopAvailable">
          <YvButton
            class="hover:bg-teal-400/20 hover:text-teal-600 active:bg-teal-400/50 active:text-teal-900"
            dark="hover:bg-teal-300/10 hover:text-teal-300 active:bg-teal-300/20 active:text-teal-500"
            @click="pks.joinWorkshop()"
          >
            <span>Join {{ pks.currentRoomId }}</span>
          </YvButton>
        </div>

        <div v-if="!pks.isConnected && !pks.isWorkshopAvailable">
          <span text="sm neutral/50">No workshops available</span>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
