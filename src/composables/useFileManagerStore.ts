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

    // Live updates via SSE
    const eventSource = new EventSource('/events');

    eventSource.addEventListener('filesChanged', (event) => {
      const { lessonName, files, error } = JSON.parse(event.data);
      errorMessage.value = '';

      if (error) {
        console.warn('[yehyecoa-vue]: Server reported an issue:', error);
        // Handle the error (show warning, use fallback lesson name, etc.)
        errorMessage.value = error;
      }

      console.log('[yehyecoa-vue]: Active lesson:', lessonName);

      if (lessonName) {
        // Normal operation
      }
      else {
        // Use fallback or show "No lesson loaded" state
      }

      // Process files as usual
      replStore.setFiles(files);
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
