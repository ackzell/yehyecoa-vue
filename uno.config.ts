import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTagify,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
} from 'unocss';
// import presetAnimations from 'unocss-preset-animations';
import { presetShadcn } from 'unocss-preset-shadcn';

export default defineConfig({
  presets: [
    presetAttributify({
      prefix: 'uno-',
    }),
    // todo: install and uncomment if shadcn acts weirdly
    // presetAnimations(),
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
    presetShadcn(
      {
        color: 'neutral',
        // With default setting for SolidUI, you need to set the darkSelector option.
        darkSelector: '.dark',
      },
      {
        // If you are using reka ui.
        componentLibrary: 'reka',
      },
    ),
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
  transformers: [
    transformerDirectives(),
  ],
  shortcuts: {
    'sc-toolbar-btn': 'hover:text-foreground/80 hover:scale-120 transition duration-200',
    'sc-btn-base': 'p-2 rounded-lg bg-transparent',
    'btn': 'sc-btn-base bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-dark-900',
    'sc-btn-outline': 'sc-btn-base outline-solid outline-neutral text-neutral hover',
    'sc-toast-base': ' bg-background py-2 px-4 rounded-md flex items-center gap-4 border shadow-md',
  },
});
