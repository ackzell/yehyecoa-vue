import { onMounted, ref } from 'vue';

import { db } from '@/db';
import { sessions } from '@/db/sessions';
import { snapshots } from '@/db/snapshots';

type SnapshotsDBComposable = {
  saveSnapshot: (files: Record<string, string>) => Promise<void>;
};

const currentSessionId = ref<number>();

export function useSnapshotsDB(): SnapshotsDBComposable {
  async function initSession(): Promise<void> {
    const name = `Session ${crypto.randomUUID().slice(0, 8)}`;

    currentSessionId.value = await sessions.create(name);
  }

  async function saveSnapshot(files: Record<string, string>): Promise<void> {
    if (!currentSessionId.value) {
      console.error('No active session. Cannot save snapshot.');
      return;
    }

    const currentTime = new Date();

    await snapshots.create({
      sessionId: currentSessionId.value,
      files,
      type: 'manual',
      message: 'Manual snapshot',
    });

    // Update session's updatedAt timestamp
    await db.sessions.update(currentSessionId.value, { updatedAt: currentTime });
  }

  onMounted(() => {
    initSession();
  });

  return {
    saveSnapshot,
  };
}
