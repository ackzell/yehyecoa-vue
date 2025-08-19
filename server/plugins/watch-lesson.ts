import { watch } from 'node:fs'
import { readFile } from 'node:fs/promises'

export default defineNitroPlugin(() => {
  const filePath = 'lessonFile.vue'

  console.log('[file-watcher] Starting watcher for:', filePath)

  const watcher = watch(filePath, { encoding: 'utf-8' }, async (eventType) => {
    try {
      console.log(`[watch] lessonFile.vue changed (${eventType})`)
      const content = await readFile(filePath, 'utf-8')
      broadcastFileChange('lessonFile.vue', content)
    } catch (err) {
      console.error('Error reading lesson file:', err)
    }
  })

  // Cleanup
  process.on('SIGINT', () => watcher.close())
  process.on('SIGTERM', () => watcher.close())
})
