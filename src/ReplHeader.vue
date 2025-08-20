<script setup lang="ts">
import { onMounted } from 'vue';
import Moon from '@/icons/MoonIcon.vue';
import Sun from '@/icons/SunIcon.vue';

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
  <nav>
    <h1>
      <!-- TODO: maybe a logo would be cool -->
      <!-- <img alt="logo" src="/logo.svg" /> -->
      <span>Vue live playground</span>
    </h1>
    <div class="links">
      <button
        :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
        class="toggle-dark"
        @click="setTheme"
      >
        <Sun class="light" />
        <Moon class="dark" />
      </button>
    </div>
  </nav>
</template>

<style>
nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;
  --btn: #666;
  --highlight: #333;
  --green: #3ca877;
  --purple: #904cbc;
  --btn-bg: #eee;

  color: var(--base);
  height: var(--nav-height);
  box-sizing: border-box;
  padding: 0 1em;
  background-color: var(--bg);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
}

.dark nav {
  --base: #ddd;
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;
  --highlight: #fff;
  --btn-bg: #333;

  box-shadow: none;
  border-bottom: 1px solid var(--border);
}

h1 {
  font-weight: 500;
  display: inline-flex;
  place-items: center;
}

h1 img {
  height: 24px;
  margin-right: 10px;
}

@media (max-width: 560px) {
  h1 span {
    font-size: 0.9em;
  }
}

@media (max-width: 520px) {
  h1 span {
    display: none;
  }
}

.links {
  display: flex;
}

.toggle-dark svg {
  width: 18px;
  height: 18px;
}

.toggle-dark .dark,
.dark .toggle-dark .light {
  display: none;
}

.dark .toggle-dark .dark {
  display: inline-block;
}

.links button,
.links .github {
  padding: 1px 6px;
  color: var(--btn);
}

.links button:hover,
.links .github:hover {
  color: var(--highlight);
}

.links > * {
  display: flex;
  align-items: center;
}

.links > * + * {
  margin-left: 4px;
}
</style>
