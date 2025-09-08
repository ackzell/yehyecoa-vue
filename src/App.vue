<script setup lang="ts">
import YVHeader from '@/components/YvHeader.vue';
import YvToasts from './components/toasts/YvToasts.vue';
// import Drawer from './components/ui/drawer/Drawer.vue';
import YvFooter from './components/YvFooter.vue';
import YvRepl from './components/YvRepl.vue';
import YvSidebar from './components/YvSidebar/YvSidebar.vue';
import 'vue-sonner/style.css'; // vue-sonner v2 requires this import
import '@vue/repl/style.css';

function setVH() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
}
window.addEventListener('resize', setVH);

setVH();
</script>

<template>
  <!-- <Drawer v-model:open="isDo" :default-open="true" direction="right"> -->
  <main class="repl-container" font-sans text-primary vaul-drawer-wrapper>
    <YvToasts />
    <YVHeader />
    <YvSidebar>
      <YvRepl />
    </YvSidebar>
    <YvFooter />
  </main>
  <!-- </Drawer> -->
</template>

<style>
body {
  font-size: 13px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
  --footer-height: 40px;
}

.dark {
  color-scheme: dark;
}
</style>
