import type { Session, Snapshot } from '@/db';
import { useStore } from '@vue/repl';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref, watch } from 'vue';

import { sessions } from '@/db/sessions';
import { snapshots } from '@/db/snapshots';

export const useFileManagerStore = defineStore('file-manager', () => {
  const currentSession = ref<Session>();
  const replStore = useStore();
  const errorMessage = ref('');
  const isDrawerOpen = ref(false);

  const sessionList = ref<Session[]>([]);
  const snapshotsList = ref<Snapshot[]>([]);

  initSession();

  async function initSession(): Promise<void> {
    const name = `Session ${crypto.randomUUID().slice(0, 8)}`;

    currentSession.value = await sessions.create(name);

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
  }

  async function saveSnapshot(): Promise<void> {
    if (!currentSession.value) {
      console.error('No active session. Cannot save snapshot.');
      return;
    }

    const newSnapshot = await snapshots.create({
      sessionId: currentSession.value.id,
      files: replStore.getFiles(),
      type: 'manual',
      message: 'Manual',
    });

    sessions.changeUpdatedAt(currentSession.value.id, newSnapshot?.createdAt);
  }

  async function deleteSnapshot(snapshotId: number): Promise<void> {
    await snapshots.deleteSnapshot(snapshotId);
  }

  async function restoreSnapshot(snapshot: Snapshot): Promise<void> {
    replStore.setFiles(snapshot.files);
  }

  sessions.liveQuerySessions().subscribe((sessions) => {
    sessionList.value = sessions;
  });

  watch(currentSession, (newSession, _, onCleanup) => {
    if (newSession) {
      const subscription = snapshots.liveQuerySnapshots(newSession.id).subscribe((snaps) => {
        snapshotsList.value = snaps;
      });

      onCleanup(() => {
        subscription.unsubscribe();
      });
    }
  }, {
    immediate: true,
  });

  return {
    currentSession,
    replStore,
    isDrawerOpen,

    snapshotsList,
    saveSnapshot,
    deleteSnapshot,
    restoreSnapshot,

    sessionList,

    errorMessage,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFileManagerStore, import.meta.hot));
}
