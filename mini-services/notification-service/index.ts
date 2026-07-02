import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface ConnectedUser {
  id: string
  userId: string
  role: string
  name: string
}

const connectedUsers = new Map<string, ConnectedUser>()

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('authenticate', (data: { userId: string; role: string; name: string }) => {
    const user: ConnectedUser = {
      id: socket.id,
      userId: data.userId,
      role: data.role,
      name: data.name,
    }
    connectedUsers.set(socket.id, user)
    console.log(`Authenticated: ${data.name} (${data.role})`)
    
    // Send online count
    io.emit('online-count', { count: connectedUsers.size })
  })

  // Send notification to specific user or role
  socket.on('send-notification', (data: { 
    targetUserId?: string
    targetRole?: string
    title: string
    message: string
    type?: string
  }) => {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      timestamp: new Date().toISOString(),
    }

    if (data.targetUserId) {
      // Send to specific user
      for (const [sid, user] of connectedUsers.entries()) {
        if (user.userId === data.targetUserId) {
          io.to(sid).emit('notification', notification)
        }
      }
    } else if (data.targetRole) {
      // Send to all users with role
      for (const [sid, user] of connectedUsers.entries()) {
        if (user.role === data.targetRole) {
          io.to(sid).emit('notification', notification)
        }
      }
    } else {
      // Broadcast to all
      io.emit('notification', notification)
    }
  })

  // Real-time data updates
  socket.on('data-update', (data: { entity: string; action: string; payload: any }) => {
    // Broadcast data changes to all connected clients
    socket.broadcast.emit('data-updated', {
      entity: data.entity,
      action: data.action,
      payload: data.payload,
      timestamp: new Date().toISOString(),
    })
  })

  // Chat/messaging between users
  socket.on('send-message', (data: {
    targetUserId: string
    senderName: string
    message: string
  }) => {
    const msg = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: data.senderName,
      message: data.message,
      timestamp: new Date().toISOString(),
    }
    for (const [sid, user] of connectedUsers.entries()) {
      if (user.userId === data.targetUserId) {
        io.to(sid).emit('receive-message', msg)
      }
    }
  })

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      console.log(`${user.name} disconnected`)
      connectedUsers.delete(socket.id)
      io.emit('online-count', { count: connectedUsers.size })
    }
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Notification WebSocket service running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  httpServer.close(() => process.exit(0))
})
