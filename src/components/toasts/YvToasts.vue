<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { useToastsStore } from './useToastsStore';

const props = defineProps<YvToastsProps>();

const { activeToasts, toast } = useToastsStore();

type YvToastsProps = {
  /**
   * Number of toasts visible by default
   */
  stackLimit?: number;
};

// Store timeout data for each toast
const toastTimers = ref(new Map<string, {
  timeoutId: number;
  remainingTime: number;
  startTime: number;
  originalDuration: number;
  stop: () => void;
}>());

const defaultDurations = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

function getToastIcon(type: string) {
  const icons = {
    success: 'i-mynaui:check-hexagon-solid text-emerald-500',
    error: 'i-mynaui:x-hexagon-solid text-red-500',
    warning: 'i-mynaui:danger-hexagon-solid text-amber-500',
    info: 'i-mynaui:info-hexagon-solid text-blue-500',
  };
  return icons[type as keyof typeof icons] || icons.info;
}

function getToastClasses(type: string) {
  const classes = {
    success: 'text-emerald-500 border-emerald-500/10',
    error: 'text-red-500 border-red-500/10',
    warning: 'text-amber-500 border-amber-500/10',
    info: 'text-blue-500 border-blue-500/10',
  };
  return classes[type as keyof typeof classes] || classes.info;
}

function handleToastClick(toastId: string) {
  const timer = toastTimers.value.get(toastId);
  if (timer) {
    timer.stop();
    toastTimers.value.delete(toastId);
  }
  toast.dismiss(toastId);
}

function createAutoDissmiss(toastId: string, type: string, duration?: number) {
  const shouldAutoDismiss = duration !== Infinity && duration !== 0;
  if (!shouldAutoDismiss)
    return null;

  const autoDismissDelay = duration
    || defaultDurations[type as keyof typeof defaultDurations]
    || defaultDurations.info;

  const startTime = Date.now();
  const timeoutId = window.setTimeout(() => {
    toast.dismiss(toastId);
    toastTimers.value.delete(toastId);
  }, autoDismissDelay);

  const timer = {
    timeoutId,
    remainingTime: autoDismissDelay,
    startTime,
    originalDuration: autoDismissDelay,
    stop: () => clearTimeout(timeoutId),
  };

  toastTimers.value.set(toastId, timer);
  return timer;
}

function pauseAutoDissmiss(toastId: string) {
  const timer = toastTimers.value.get(toastId);
  if (timer) {
    clearTimeout(timer.timeoutId);
    const elapsed = Date.now() - timer.startTime;
    timer.remainingTime = Math.max(0, timer.originalDuration - elapsed);
    toastTimers.value.set(toastId, timer);
  }
}

function resumeAutoDissmiss(toastId: string) {
  const timer = toastTimers.value.get(toastId);
  if (timer && timer.remainingTime > 0) {
    timer.startTime = Date.now();
    timer.originalDuration = timer.remainingTime;
    timer.timeoutId = window.setTimeout(() => {
      toast.dismiss(toastId);
      toastTimers.value.delete(toastId);
    }, timer.remainingTime);
    timer.stop = () => clearTimeout(timer.timeoutId);
    toastTimers.value.set(toastId, timer);
  }
}

// Watch for changes in active toasts and manage timers
watchEffect(() => {
  const activeToastIds = new Set(activeToasts.map(t => t.id));

  activeToasts.forEach((activeToast) => {
    if (!toastTimers.value.has(activeToast.id)) {
      createAutoDissmiss(
        activeToast.id,
        activeToast.type || 'info',
        activeToast.duration,
      );
    }
  });

  Array.from(toastTimers.value.keys()).forEach((toastId) => {
    if (!activeToastIds.has(toastId)) {
      const timer = toastTimers.value.get(toastId);
      if (timer) {
        timer.stop();
        toastTimers.value.delete(toastId);
      }
    }
  });
});

// --- STACKING LOGIC ---
const stackLimit = computed(() => props.stackLimit ?? 4);
const isStackHovered = ref(false);

const visibleToasts = computed(() => {
  if (isStackHovered.value)
    return activeToasts;

  // Always show the newest ones
  return activeToasts.slice(-stackLimit.value);
});

const hiddenCount = computed(() => {
  return Math.max(0, activeToasts.length - visibleToasts.value.length);
});
</script>

<template>
  <div class="fixed top-0 left-0 right-0 z-[13] pointer-events-none">
    <div
      class="flex flex-col items-center gap-2 p-4 pt-[55px]"
      @mouseenter="isStackHovered = true"
      @mouseleave="isStackHovered = false"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col items-center gap-2"
      >
        <div
          v-for="activeToast in visibleToasts"
          :key="activeToast.id"
          sc-toast-base bg="opacity-90 background"
          flex="~ items-center gap-3"
          py-2 px-4 cursor-pointer select-none
          hover="opacity-100 scale-105"
          transition="transition-all duration-200 ease-in-out"
          class="border rounded-lg pointer-events-auto active:scale-98"
          :class="getToastClasses(activeToast.type || 'info')"
          @click="handleToastClick(activeToast.id)"
          @mouseenter="pauseAutoDissmiss(activeToast.id)"
          @mouseleave="resumeAutoDissmiss(activeToast.id)"
        >
          <span
            class="inline-block text-sm align-middle"
            :class="getToastIcon(activeToast.type || 'info')"
          />
          <div class="flex-1">
            <div v-if="activeToast.title" class="font-medium">
              {{ activeToast.title }}
            </div>
            <div
              v-if="activeToast.description"
              class="text-neutral dark:text-neutral-400/90"
              :class="{ 'mt-1': activeToast.title }"
            >
              {{ activeToast.description }}
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div
        v-if="hiddenCount > 0 && !isStackHovered"
        class="text-xs cursor-pointer text-neutral dark:text-neutral-400/90"
      >
        +{{ hiddenCount }} more
      </div>
    </div>
  </div>
</template>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
