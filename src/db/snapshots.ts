import type { Observable } from 'dexie';

import type { Snapshot } from '@/db';
import { liveQuery } from 'dexie';

import { db } from '@/db';

export const snapshots = {
  create,
  liveQuerySnapshots,
  getLatestManualSnapshot,
  deleteSnapshot,
};

async function create({ sessionId, files, type = 'manual', message = '' }: Omit<Snapshot, 'id' | 'createdAt'>,
): Promise<Snapshot> {
  const createdAt = new Date();

  const snapshotId = await db.snapshots.add({
    sessionId,
    files: JSON.parse(JSON.stringify(files)), // Deep copy
    createdAt,
    type,
    message,
  });

  return await db.snapshots.get(snapshotId) as Snapshot;
}

function liveQuerySnapshots(sessionId: number): Observable<Snapshot[]> {
  return liveQuery(async () => await db.snapshots.where({ sessionId }).reverse().sortBy('createdAt'));
}

async function getLatestManualSnapshot(): Promise<Snapshot | undefined> {
  return (await db.snapshots.where({ type: 'manual' }).reverse().sortBy('createdAt')).pop();
}

function deleteSnapshot(snapshotId: number): Promise<void> {
  return db.snapshots.delete(snapshotId);
}
