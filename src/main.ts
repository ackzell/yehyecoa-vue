import 'floating-vue/dist/style.css';
import 'virtual:uno.css';

import FloatingVue from 'floating-vue';
import { createApp } from 'vue';

import App from './App.vue';

createApp(App)
  .use(FloatingVue)
  .mount('#app');
