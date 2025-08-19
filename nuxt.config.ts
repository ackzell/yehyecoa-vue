import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@unocss/nuxt', '@vueuse/nuxt', '@nuxt/icon'],

  ssr: false,

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  compatibilityDate: '2024-11-01',
  // Try full client-side rendering first

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        semi: true,
      },
    },
  },
  unocss: {
    nuxtLayers: true,
  },
});
