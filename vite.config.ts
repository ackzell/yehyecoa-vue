import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import version from 'vite-plugin-package-version';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
    version(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        // Force all chunks to be processed
        inlineDynamicImports: false,
      },
    },
  },
});
