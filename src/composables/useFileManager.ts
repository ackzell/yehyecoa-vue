import type { ReplStore } from '@vue/repl';

import type { Ref } from 'vue';

import type { Snapshot } from '@/db';

import { useStore } from '@vue/repl';
import { onMounted, ref, watch } from 'vue';

import { sessions } from '@/db/sessions';
import { snapshots } from '@/db/snapshots';

type FileManager = {
  replStore: ReplStore;
  errorMessage: Ref<string>;
  snapshots: Ref<Snapshot[]>;
  saveSnapshot: () => Promise<void>;
};

const fileManagerInstance = ref<FileManager>();

export function useFileManager(): FileManager {
  if (!fileManagerInstance.value) {
    fileManagerInstance.value = FileManagerImpl();
  }
  return fileManagerInstance.value;
}

function FileManagerImpl(): FileManager {
  const currentSessionId = ref<number>();
  const replStore = useStore();
  const errorMessage = ref('');
  const liveSnapshots = ref<Snapshot[]>([]);

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

  watch(currentSessionId, (newId) => {
    if (newId) {
      snapshots.liveQuerySnapshots(newId).subscribe((snaps) => {
        liveSnapshots.value = snaps;
        console.log(liveSnapshots);
      });
    }
  }, {
    immediate: true,
  });

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
    snapshots: liveSnapshots,

    saveSnapshot,
  };
}
