import FloatingVue from 'floating-vue';
import { createApp } from 'vue';

import App from './App.vue';
import 'floating-vue/dist/style.css';

import 'virtual:uno.css';

createApp(App)
  .use(FloatingVue)
  .mount('#app');
