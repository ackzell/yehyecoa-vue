import type { SnapshotType } from '@/db';
import { db } from '@/db';

export const snapshots = {
  create,
};

type createParams = {
  sessionId: number;
  files: Record<string, string>;
  type: SnapshotType;
  message: string;
};

async function create({ sessionId, files, type = 'manual', message = '' }: createParams,
): Promise<number | null> {
  if (!files || Object.keys(files).length === 0)
    return null;

  const snapshotId = await db.snapshots.add({
    sessionId,
    files: JSON.parse(JSON.stringify(files)), // Deep copy
    createdAt: new Date(),
    type,
    message,
  });

  return snapshotId;
}
