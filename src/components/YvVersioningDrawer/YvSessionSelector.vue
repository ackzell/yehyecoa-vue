<script setup lang="ts">
import { useTimeAgoIntl } from '@vueuse/core';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFileManagerStore } from '@/composables/useFileManagerStore';

const fm = useFileManagerStore();
</script>

<template>
  <div flex="~ items-center">
    <Select v-model="fm.currentSession">
      <SelectTrigger class="w-full">
        <SelectValue :placeholder="`Your sessions (${fm.sessionList.length})`" />
      </SelectTrigger>
      <SelectContent class="SelectContent">
        <SelectGroup>
          <SelectItem v-for="session in fm.sessionList" :key="session.id" :value="session">
            {{ session.name }}
            <span text="xs neutral">
              (updated: {{ useTimeAgoIntl(session.updatedAt) }})
            </span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <!-- <div>
      Total sessions:   {{ fm.sessionList.length }}
    </div> -->
  </div>
</template>

<style>
.SelectContent {
  /* max-height: var(--reka-select-content-available-height); */
  max-height: 400px;
}
</style>
