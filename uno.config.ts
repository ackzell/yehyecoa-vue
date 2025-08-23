import { defineConfig, presetAttributify, presetTagify, presetTypography, presetWebFonts, presetWind4 } from 'unocss';

export default defineConfig({
  presets: [
    presetAttributify({
      prefix: 'uno-',
    }),
    presetWind4(),
    presetTypography(),
    presetWebFonts(),
    presetTagify(),
  ],
  theme: {
    fontFamily: {
      sans: 'Roboto, sans-serif',
    },
    colors: {

    },
  },
});
