'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from './store'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  timestamp: string
}

interface DataUpdate {
  entity: string
  action: string
  payload: any
  timestamp: string
}

let socket: Socket | null = null

export function useWebSocket() {
  const user = useAppStore((s) => s.user)
  const [onlineCount, setOnlineCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastDataUpdate, setLastDataUpdate] = useState<DataUpdate | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user) return

    // Connect to WebSocket with XTransformPort for gateway
    if (!socket) {
      socket = io('/?XTransformPort=3003', {
        path: '/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
      })

      socket.on('connect', () => {
        setConnected(true)
        socket?.emit('authenticate', {
          userId: user.id,
          role: user.role,
          name: user.name,
        })
      })

      socket.on('disconnect', () => {
        setConnected(false)
      })

      socket.on('online-count', (data: { count: number }) => {
        setOnlineCount(data.count)
      })

      socket.on('notification', (notif: Notification) => {
        setNotifications((prev) => [notif, ...prev].slice(0, 50))
      })

      socket.on('data-updated', (update: DataUpdate) => {
        setLastDataUpdate(update)
      })
    } else {
      // Already connected, re-authenticate
      socket.emit('authenticate', {
        userId: user.id,
        role: user.role,
        name: user.name,
      })
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    }
  }, [user])

  const sendNotification = useCallback((data: {
    targetUserId?: string
    targetRole?: string
    title: string
    message: string
    type?: string
  }) => {
    socket?.emit('send-notification', data)
  }, [])

  const broadcastDataUpdate = useCallback((entity: string, action: string, payload?: any) => {
    socket?.emit('data-update', { entity, action, payload })
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    connected,
    onlineCount,
    notifications,
    clearNotifications,
    lastDataUpdate,
    sendNotification,
    broadcastDataUpdate,
  }
}
