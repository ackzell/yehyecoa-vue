import type { RemovableRef } from '@vueuse/core';
import { useStorage } from '@vueuse/core';
import { nextTick, ref } from 'vue';

type Theme = 'dark' | 'light';
type Layout = 'horizontal' | 'vertical';

type YVSettingsStore = {
  settings: typeof settings;
  toggleLayout: () => void;
  toggleTheme: () => void;
  toggleOutput: () => void;
  toggleConsole: () => void;
  toggleOutputLayout?: () => void;
  toggleLayoutReverse?: () => void;
};

type YVSettings = {
  theme: RemovableRef<Theme>;
  layout: RemovableRef<Layout>;
  showOutput?: RemovableRef<boolean>;
  showConsole?: RemovableRef<boolean>;
  outputLayout?: RemovableRef<Layout>;
  layoutReverse?: RemovableRef<boolean>;
};

const settings = ref<YVSettings>({
  theme: useStorage<Theme>('yehyecoa-vue-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  layout: useStorage<Layout>('yehyecoa-vue-layout', 'horizontal'),
  showOutput: useStorage<boolean>('yehyecoa-vue-show-output', true),
  showConsole: useStorage<boolean>('yehyecoa-vue-show-console', true),
  outputLayout: useStorage<Layout>('yehyecoa-vue-output-layout', 'vertical'),
  layoutReverse: useStorage<boolean>('yehyecoa-vue-layout-reverse', false),
});

export function useSettingsStore(): YVSettingsStore {
  function toggleLayout(): void {
    settings.value.layout = settings.value.layout === 'horizontal' ? 'vertical' : 'horizontal';
  }

  const cls = document.documentElement.classList;

  function toggleTheme(): void {
    settings.value.theme = settings.value.theme === 'dark' ? 'light' : 'dark';

    nextTick(() => {
      if (settings.value.theme === 'dark') {
        cls.add('dark');
      }
      else {
        cls.remove('dark');
      }
    });
  }

  function toggleOutput(): void {
    settings.value.showOutput = !settings.value.showOutput;
  }

  function toggleConsole(): void {
    settings.value.showConsole = !settings.value.showConsole;
  }

  function toggleOutputLayout(): void {
    settings.value.outputLayout = settings.value.outputLayout === 'horizontal'
      ? 'vertical'
      : 'horizontal';
  }

  function toggleLayoutReverse(): void {
    settings.value.layoutReverse = !settings.value.layoutReverse;
  }

  return {
    settings,
    toggleLayout,
    toggleTheme,
    toggleOutput,
    toggleConsole,
    toggleOutputLayout,
    toggleLayoutReverse,
  };
}
