import type { ReplStore } from '@vue/repl';
import type { Ref } from 'vue';

import { useStore } from '@vue/repl';

import { onMounted, ref } from 'vue';

import { sessions } from '@/db/sessions';
import { snapshots } from '@/db/snapshots';

type FileManager = {
  replStore: ReplStore;
  errorMessage: Ref<string>;

  saveSnapshot: () => Promise<void>;
};

const currentSessionId = ref<number>();
const replStore = useStore();
const errorMessage = ref('');

export function useFileManager(): FileManager {
  async function initSession(): Promise<void> {
    const name = `Session ${crypto.randomUUID().slice(0, 8)}`;

    currentSessionId.value = await sessions.create(name);
  }

  async function saveSnapshot(): Promise<void> {
    if (!currentSessionId.value) {
      console.error('No active session. Cannot save snapshot.');
      return;
    }

    await snapshots.create({
      sessionId: currentSessionId.value,
      files: replStore.getFiles(),
      type: 'manual',
      message: 'Manual snapshot',
    });

    sessions.updateCreatedAt(currentSessionId.value);
  }

  onMounted(async () => {
    initSession();

    // Initial load
    try {
      const fileContents = await fetch('/lessonFile.vue').then(r => r.text());
      replStore.setFiles({ 'src/App.vue': fileContents });
    }
    catch {
      errorMessage.value = 'Failed to load lessonFile.vue';
      console.error('Failed to load `lessonFile.vue`, makes sure you created one in the root directory.');
    }

    // Live updates via SSE
    const es = new EventSource('/events');
    es.addEventListener('fileUpdate', (event) => {
      const { filename, content } = JSON.parse(event.data);
      if (filename === 'lessonFile.vue') {
        replStore.setFiles({ 'src/App.vue': content });
      }
    });
  });

  return {
    replStore,
    errorMessage,

    saveSnapshot,
  };
}
