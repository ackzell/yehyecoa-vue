import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(event: any) {
  console.log('[API] lesson-file.get', event)
  try {
    const filePath = join(process.cwd(), 'lessonFile.vue');
    const content = await readFile(filePath, 'utf-8');

    return {
      content,
      filename: 'lessonFile.vue',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'lessonFile.vue not found'
    });
  }
}
