import type { Session, Snapshot } from '@/db';
import { useStore } from '@vue/repl';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { sessions } from '@/db/sessions';
import { snapshots } from '@/db/snapshots';

// const IGNORE_FILES = ['tsconfig.json', 'import-map.json'];

export const useFileManagerStore = defineStore('file-manager', () => {
  const currentSession = ref<Session>();
  const replStore = useStore();
  const errorMessage = ref('');
  const isDrawerOpen = ref(false);

  const sessionList = ref<Session[]>([]);
  const snapshotsList = ref<Snapshot[]>([]);

  initSession();

  async function initSession(): Promise<void> {
    const eventSource = new EventSource('/events');

    eventSource.onerror = async () => {
      console.warn('[yehyecoa-vue]: events endpoint not available. App is running standalone.');

      toast.warning('No events endpoint available', {
        description: 'App is running standalone.',
        duration: Infinity,
      });

      if (await sessions.getCount() === 0) {
        currentSession.value = await sessions.create(`Session ${crypto.randomUUID().slice(0, 8)}`);
      }

      if (!currentSession.value) {
        currentSession.value = await sessions.getLatestSession();
      }
    };

    // Live updates via SSE
    eventSource.addEventListener('filesChanged', async (event) => {
      const { lessonName, files, error } = JSON.parse(event.data);

      // most likely the yv-lesson.json file is not available
      if (error) {
        console.warn('[yehyecoa-vue]: Server reported an issue:', error);
        errorMessage.value = error;
        toast.error('Error', {
          description: error,
          duration: Infinity,
        });
      }

      console.warn('[yehyecoa-vue]: Active lesson:', lessonName);
      console.warn('[yehyecoa-vue]: Files changed, updating repl', files);
      replStore.setFiles(files);

      if (lessonName) {
        errorMessage.value = '';
        // only create if there is no session with the same name
        const session = await sessions.getByName(lessonName);
        if (session) {
          currentSession.value = session;
        }
        else {
          currentSession.value = await sessions.create(lessonName);
        }
      }
    });
  }

  async function saveSnapshot(snapshot: Pick<Snapshot, 'type' | 'message'>): Promise<void> {
    if (!currentSession.value) {
      console.error('No active session. Cannot save snapshot.');
      toast.error('No active session. Cannot save snapshot.');
      return;
    }

    const latestManualSnapshot = await snapshots.getLatestManualSnapshot();

    if (snapshot.type !== 'manual' || !latestManualSnapshot) {
      snapshots.create({
        sessionId: currentSession.value.id,
        files: replStore.getFiles(),
        type: snapshot.type,
        message: snapshot.message,
      });

      sessions.changeUpdatedAt(currentSession.value.id, new Date());
    }
    else {
      const didFilesChange = replStore.getFiles()['App.vue'] !== latestManualSnapshot.files['App.vue'];

      if (didFilesChange) {
        snapshots.create({
          sessionId: currentSession.value.id,
          files: replStore.getFiles(),
          type: snapshot.type,
          message: snapshot.message,
        });

        sessions.changeUpdatedAt(currentSession.value.id, new Date());
        toast.success('Snapshot saved');
      }
      else {
        toast.info('Nothing new to save');
      }
    }
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
