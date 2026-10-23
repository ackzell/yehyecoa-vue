import type { editor } from 'monaco-editor-core';

import type { Session, Snapshot } from '@/db';
import { useStore } from '@calmecac-vue/repl';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref, watch } from 'vue';

import { useToastsStore } from '@/components/toasts/useToastsStore';
import { sessions } from '@/db/sessions';
import { snapshots } from '@/db/snapshots';

// const IGNORE_FILES = ['tsconfig.json', 'import-map.json'];

export const useFileManagerStore = defineStore('fileManagerStore', () => {
  const currentSession = ref<Session>();
  const replStore = useStore<editor.IStandaloneCodeEditor>();
  const isDrawerOpen = ref(false);

  const sessionList = ref<Session[]>([]);
  const snapshotsList = ref<Snapshot[]>([]);

  const { toast } = useToastsStore();

  initSession();

  async function initSession(): Promise<void> {
    if (await sessions.getCount() === 0) {
      currentSession.value = await sessions.create(`Session ${crypto.randomUUID()}`);
    }

    if (!currentSession.value) {
      currentSession.value = await sessions.getLatestSession();
    }
  }

  async function saveSnapshot(snapshot: Pick<Snapshot, 'type' | 'message'>): Promise<void> {
    if (!currentSession.value) {
      console.error('No active session. Cannot save snapshot.');
      toast.error('No active session. Cannot save snapshot.');
      return;
    }

    const latestSnapshotByType = await snapshots.getLatestByType(snapshot.type);

    if (!latestSnapshotByType) {
      snapshots.create({
        sessionId: currentSession.value.id,
        files: replStore.getFiles(),
        type: snapshot.type,
        message: snapshot.message,
      });

      sessions.changeUpdatedAt(currentSession.value.id, new Date());
    }
    else {
      const didFilesChange = replStore.getFiles()['App.vue'] !== latestSnapshotByType.files['App.vue'];

      if (didFilesChange) {
        snapshots.create({
          sessionId: currentSession.value.id,
          files: replStore.getFiles(),
          type: snapshot.type,
          message: snapshot.message,
        });

        sessions.changeUpdatedAt(currentSession.value.id, new Date());
        if (snapshot.type === 'manual') {
          toast.success('Snapshot saved');
        }
      }
      else {
        if (snapshot.type === 'manual') {
          toast.info('Nothing new to save');
        }
      }
    }
  }

  async function deleteSnapshot(snapshotId: number): Promise<void> {
    await snapshots.deleteSnapshot(snapshotId);
  }

  async function restoreSnapshot(snapshot: Snapshot): Promise<void> {
    // save the current contents of the repl in a snapshot before updating the repl
    await saveSnapshot({
      type: 'auto',
      message: 'Before a snapshot was restored',
    });

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
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFileManagerStore, import.meta.hot));
}
