import { db } from '@/db';

export const sessions = {
  create,
  updateCreatedAt,
};

async function create(name: string): Promise<number> {
  const currentTime = new Date();
  return await db.sessions.add({
    name,
    createdAt: currentTime,
    updatedAt: currentTime,
  });
}

async function updateCreatedAt(sessionId: number): Promise<void> {
  const currentTime = new Date();
  await db.sessions.update(sessionId, { updatedAt: currentTime });
}
