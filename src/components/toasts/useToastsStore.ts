import type { Ref } from 'vue';

import { defineStore } from 'pinia';
import { ref } from 'vue';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastsStore = {
  activeToasts: Ref<Toast[]>;

  toast: {
    success: (title: string, toast?: Omit<Partial<Toast>, 'id'>) => string;
    error: (title: string, toast?: Omit<Partial<Toast>, 'id'>) => string;
    warning: (title: string, toast?: Omit<Partial<Toast>, 'id'>) => string;
    info: (title: string, toast?: Omit<Partial<Toast>, 'id'>) => string;

    dismiss: (id: string) => void;
  };
};

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description: string;
  duration?: number;
};

const defaultToast: Omit<Toast, 'id'> = {
  type: 'info',
  title: '',
  description: '',
  duration: 4000,
};

export const useToastsStore = defineStore<'toastStore', ToastsStore>('toastStore', (): ToastsStore => {
  const activeToasts = ref<Toast[]>([]);

  function addToast(toast: Omit<Partial<Toast>, 'id'>): string {
    const id = crypto.randomUUID().slice(0, 8);
    activeToasts.value.push({ id, ...defaultToast, ...toast });
    return id;
  };

  function dismiss(id: string): void {
    const index = activeToasts.value.findIndex(t => t.id === id);
    if (index > -1)
      activeToasts.value.splice(index, 1);
  };

  function success(title: string, toast?: Omit<Partial<Toast>, 'id'>): string {
    return addToast({ ...toast, title, type: 'success' });
  };

  function error(title: string, toast?: Omit<Partial<Toast>, 'id'>): string {
    return addToast({ ...toast, title, type: 'error' });
  };

  function info(title: string, toast?: Omit<Partial<Toast>, 'id'>): string {
    return addToast({ ...toast, title, type: 'info' });
  };

  function warning(title: string, toast?: Omit<Partial<Toast>, 'id'>): string {
    return addToast({ ...toast, title, type: 'warning' });
  };

  return {
    activeToasts,

    toast: {
      success,
      error,
      info,
      warning,
      dismiss,
    },
  };
});
