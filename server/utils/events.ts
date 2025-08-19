const clients: any[] = []

export function addClient(res: any) {
  clients.push(res)
  console.log('[SSE] Client connected, total:', clients.length)
}

export function removeClient(res: any) {
  const idx = clients.indexOf(res)
  if (idx !== -1) {
    clients.splice(idx, 1)
  }
  console.log('[SSE] Client disconnected, total:', clients.length)
}

export function broadcastFileChange(filename: string, content: string) {
  const message = `event: fileUpdate\ndata: ${JSON.stringify({ filename, content })}\n\n`

  const deadClients: any[] = []

  clients.forEach((client) => {
    try {
      client.write(message)
    } catch (err) {
      console.log('[SSE] Removing dead client connection')
      deadClients.push(client)
    }
  })

  // Clean up dead connections
  deadClients.forEach(client => removeClient(client))
}
