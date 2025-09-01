import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
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
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log'],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
  // This is key - force dependency optimization
  optimizeDeps: {
    include: ['@vue/repl', '@vue/repl/monaco-editor', '@vue/repl/codemirror-editor'],
    force: true,
  },
});
