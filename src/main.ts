import FloatingVue from 'floating-vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';

import 'floating-vue/dist/style.css';
import 'virtual:uno.css';
import './styles/overrides.css';

const pinia = createPinia();

const floatingVueConfig = {
  themes: {
    'diff-card': {
      $extend: 'menu',
      triggers: ['hover', 'focus', 'click'],
      autoHide: false,
    },
  },
};

createApp(App)
  .use(pinia)
  .use(FloatingVue, floatingVueConfig)
  .mount('#app');
