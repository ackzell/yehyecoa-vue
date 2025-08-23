import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTagify,
  presetTypography,
  presetWebFonts,
  presetWind4,
} from 'unocss';

export default defineConfig({
  presets: [
    presetAttributify({
      prefix: 'uno-',
    }),
    presetWind4(),
    presetTypography(),
    presetWebFonts(),
    presetTagify({
      prefix: 'uno-',
    }),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        mynaui: () => import('@iconify-json/mynaui/icons.json').then(i => i.default),
      },
      customizations: {
        customize(props) {
          props.width = '1.5em';
          props.height = '1.5em';
          return props;
        },
      },
    }),
  ],
  // By default, `.ts` and `.js` files are NOT extracted.
  // If you want to extract them, use the following configuration.
  // It's necessary to add the following configuration if you use shadcn-vue or shadcn-svelte.
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        '(components|src)/**/*.{js,ts}',
      ],
    },
  },
  theme: {
    fontFamily: {
      sans: 'Roboto, sans-serif',
    },
    colors: {

    },
  },
  shortcuts: {
    'toolbar-btn': 'hover:text-black dark:hover:text-neutral-100 transition-colors duration-200',
  },
});
