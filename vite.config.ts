import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { WebSocketServer, WebSocket } from 'ws'

function lanSyncPlugin(): Plugin {
  let wss: WebSocketServer | null = null
  // In-memory cache so newly connected devices (e.g. LED scoreboard on another PC) receive state immediately
  const cachedState: {
    activeSession: any
    completedSessions: any[]
    steps: any[]
    participants: any[]
    auditLogs: any[]
  } = {
    activeSession: null,
    completedSessions: [],
    steps: [],
    participants: [],
    auditLogs: []
  }

  const setupWebSocket = (server: any) => {
    if (!server || wss) return
    wss = new WebSocketServer({ server, path: '/ws-sync' })

    const broadcast = (data: any, excludeWs?: WebSocket) => {
      const payload = JSON.stringify(data)
      wss?.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          client.send(payload)
        }
      })
    }

    const broadcastClientCount = () => {
      const count = wss ? wss.clients.size : 1
      broadcast({ type: 'CLIENT_COUNT', payload: { clientCount: count } })
    }

    wss.on('connection', (ws) => {
      // 1. Immediately send cached state to new client
      ws.send(JSON.stringify({
        type: 'FULL_STATE_INIT',
        payload: {
          ...cachedState,
          clientCount: wss ? wss.clients.size : 1
        }
      }))

      broadcastClientCount()

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString())
          const { type, payload } = msg

          // Update memory cache
          if (type === 'SESSION_STARTED') {
            cachedState.activeSession = payload
          } else if (type === 'SCORE_UPDATED') {
            cachedState.activeSession = payload?.session || payload
          } else if (type === 'JUDGE_FINISHED') {
            cachedState.activeSession = payload?.session || payload
            if (payload?.allFinished && payload?.session) {
              const sess = payload.session
              cachedState.completedSessions = [sess, ...cachedState.completedSessions.filter(s => s.sessionId !== sess.sessionId)]
            }
          } else if (type === 'SCORE_OVERRIDE') {
            cachedState.activeSession = payload?.session || cachedState.activeSession
          } else if (type === 'SESSION_CLEARED') {
            cachedState.activeSession = null
          } else if (type === 'STEPS_UPDATED') {
            cachedState.steps = payload
          } else if (type === 'AUDIT_UPDATED') {
            cachedState.auditLogs = [payload, ...cachedState.auditLogs.slice(0, 199)]
          } else if (type === 'STATE_PUSH') {
            if (payload?.activeSession !== undefined) cachedState.activeSession = payload.activeSession
            if (payload?.completedSessions) cachedState.completedSessions = payload.completedSessions
            if (payload?.steps) cachedState.steps = payload.steps
            if (payload?.participants) cachedState.participants = payload.participants
          } else if (type === 'REQUEST_STATE') {
            ws.send(JSON.stringify({
              type: 'FULL_STATE_INIT',
              payload: {
                ...cachedState,
                clientCount: wss ? wss.clients.size : 1
              }
            }))
            return
          }

          // Broadcast to all OTHER clients on the local network
          broadcast(msg, ws)
        } catch (err) {
          console.error('Error handling WS sync message:', err)
        }
      })

      ws.on('close', () => {
        broadcastClientCount()
      })
    })
  }

  return {
    name: 'lan-sync-plugin',
    configureServer(server) {
      setupWebSocket(server.httpServer)
    },
    configurePreviewServer(server) {
      setupWebSocket(server.httpServer)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), lanSyncPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
})

