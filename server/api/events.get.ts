import { addClient, removeClient } from '../utils/events'

export default defineEventHandler(async (event) => {
  const { node: { req, res } } = event

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  addClient(res)
  res.write('\n')

  // Remove on disconnect
  req.on('close', () => removeClient(res))

  // Keep connection alive
  return new Promise(() => { }) // Never resolve
})
