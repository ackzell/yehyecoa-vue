import {
  presetAttributify,
  presetTagify,
  presetTypography,
  presetWebFonts,
  presetWind3,
} from 'unocss';

import { mergeConfigs } from '@unocss/core';
import config from './.nuxt/uno.config.mjs';

export default mergeConfigs([
  config,
  {
    presets: [
      presetWind3(),
      presetTypography(),
      presetAttributify(),
      presetTagify({
        prefix: 'un-',
      }),
      presetWebFonts({
        provider: 'google',
        fonts: {
          // sans: 'Nunito',
          // pair: 'Alegreya',
          // numeral: 'Michroma',
          // mono: ['Fira Code', 'Fira Mono:400,700'],
        },
      }),
    ],
    theme: {
      // colors: {
      //   primary: {
      //     DEFAULT: '#d22f27',
      //     50: '#fef2f2',
      //     100: '#fee2e2',
      //     200: '#fecaca',
      //     300: '#fca5a5',
      //     400: '#f87171',
      //     500: '#ef4444',
      //     600: '#dc2626',
      //     700: '#b91c1c',
      //     800: '#991b1b',
      //     900: '#7f1d1d',
      //     950: '#450a0a',
      //   },
      //   secondary: {
      //     DEFAULT: '#e3a008',
      //     50: '#fefce8',
      //     100: '#fef9c3',
      //     200: '#fef08a',
      //     300: '#fde047',
      //     400: '#facc15',
      //     500: '#eab308',
      //     600: '#ca8a04',
      //     700: '#a16207',
      //     800: '#854d0e',
      //     900: '#713f12',
      //     950: '#422006',
      //   },
      //   accent: {
      //     DEFAULT: '#b1cc33',
      //     50: '#f7fee7',
      //     100: '#ecfccb',
      //     200: '#d9f99d',
      //     300: '#bef264',
      //     400: '#a3e635',
      //     500: '#84cc16',
      //     600: '#65a30d',
      //     700: '#4d7c0f',
      //     800: '#3f6212',
      //     900: '#365314',
      //     950: '#1a2e0d',
      //   },
      //   dark: {
      //     DEFAULT: '#1e1e1e',
      //     50: '#f4f4f4',
      //     100: '#e4e4e4',
      //     200: '#d4d4d4',
      //     300: '#c4c4c4',
      //     400: '#b4b4b4',
      //     500: '#a4a4a4',
      //     600: '#949494',
      //     700: '#848484',
      //     800: '#747474',
      //     900: '#646464',
      //     950: '#545454',
      //   },
      //   light: '#fdfdfd',
      // },
    },
    shortcuts: {
      // 'btn-base': 'font-sans px-4 py-2 rounded-md font-bold transition-all',
      // 'btn-disabled': 'disabled:opacity-50 disabled:cursor-not-allowed',
      // 'btn-hover': 'hover:not-disabled:scale-105 hover:not-disabled:shadow-lg',
      // 'btn-primary': 'text-white bg-dark hover:not-disabled:bg-primary-500',
      // btn: 'btn-base btn-primary btn-hover btn-disabled',

      // // variants
      // 'btn-outline':
      //   'btn bg-transparent text-light border border-light hover:not-disabled:bg-transparent',
      // 'btn-circle': 'btn px-3 py-3 bg-transparent text-light border border-light rounded-full aspect-square'
    },
    /**
     * UnoCSS relies on static analysis to generate classes.
     * If the class name is dynamically constructed
     * (e.g., bg-${props.styles.progressBackground}),
     * UnoCSS might not generate the required class unless
     * the value is explicitly defined in the configuration.
     */
    safelist: [
      // 'bg-primary',
      // 'bg-primary-400',
      // 'bg-primary-700',
      // 'bg-secondary',
      // 'bg-secondary-400',
      // 'bg-secondary-700',
      // 'bg-dark',
      // 'bg-dark-400',
      // 'bg-dark-700',
      // 'bg-accent-700',
    ],
  },
]);
