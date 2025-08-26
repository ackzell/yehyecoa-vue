import { db } from '@/db';

export const sessions = {
  create,
};

async function create(name: string): Promise<number> {
  const currentTime = new Date();
  return await db.sessions.add({
    name,
    createdAt: currentTime,
    updatedAt: currentTime,
  });
}
