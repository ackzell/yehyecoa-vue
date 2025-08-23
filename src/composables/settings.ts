import { useStorage, type RemovableRef } from '@vueuse/core';
import { nextTick, onMounted, ref } from 'vue';

type Theme = 'dark' | 'light';
type Layout = 'horizontal' | 'vertical';

interface YVSettingsStore {
  settings: typeof settings;
  toggleLayout: () => void;
  toggleTheme: () => void;
}

interface YVSettings {
  theme: RemovableRef<Theme>;
  layout: RemovableRef<Layout>;
}


console.log(window.matchMedia('(prefers-color-scheme: dark)').matches)

const settings = ref<YVSettings>({
  theme: useStorage<Theme>('yehyecoa-vue-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  layout: useStorage<Layout>('yehyecoa-vue-layout', 'horizontal'),
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

  onMounted(() => {
  })

  return { settings, toggleLayout, toggleTheme };
}
