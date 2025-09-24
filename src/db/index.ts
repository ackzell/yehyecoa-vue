import type { EntityTable } from 'dexie';
import Dexie from 'dexie';

export type Session = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SnapshotType = 'manual' | 'auto' | 'periodic';

export type Snapshot = {
  id: number;
  sessionId: number;
  files: Record<string, string>;
  createdAt: Date;
  type: SnapshotType;
  message: string;
};

const db = new Dexie('YehyecoaVueDB') as Dexie & {
  sessions: EntityTable<Session, 'id'>;
  snapshots: EntityTable<Snapshot, 'id'>;
};

db.version(1).stores({
  sessions: '++id, name, createdAt, updatedAt',
  snapshots: '++id, sessionId, files, createdAt, type, message',
});

export { db };
