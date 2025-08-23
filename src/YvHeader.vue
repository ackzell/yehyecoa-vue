<script setup lang="ts">
import { onMounted } from 'vue';

defineProps<{
  theme: 'dark' | 'light';
}>();

// TODO: implement the download functionality, just like the official playground
const emit = defineEmits(['set-theme']);
const cls = document.documentElement.classList;

function setTheme() {
  cls.toggle('dark');
  emit('set-theme', cls.contains('dark') ? 'dark' : 'light');
}

onMounted(() => {
  emit('set-theme', cls.contains('dark') ? 'dark' : 'light');
});
</script>

<template>
  <nav
    flex="~ justify-between"
    relative p-4 z-999 shadow-md
    bg="light dark:dark-900"
    border="b neutral-300/10"
    text="#333 dark:neutral-300"
    h="var(--nav-height)"
    transition="background-color 0.2s ease"
  >
    <h1 text-lg font-500 inline-flex items-center>
      <!-- TODO: maybe a logo would be cool -->
      <!-- <img alt="logo" src="/logo.svg" /> -->
      <span uno-hidden sm:inline-block>yehyecoa-vue</span>
    </h1>
    <div flex gap-2 text-neutral-500>
      <button
        toolbar-btn
        :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
        @click="setTheme"
      >
        <div class="i-carbon:sun dark:i-carbon:moon" />
      </button>
    </div>
  </nav>
</template>

<style>

</style>
