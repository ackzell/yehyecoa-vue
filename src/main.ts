import FloatingVue from 'floating-vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';

import 'floating-vue/dist/style.css';
import 'virtual:uno.css';

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(FloatingVue)
  .mount('#app');
