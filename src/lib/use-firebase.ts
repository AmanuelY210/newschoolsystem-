'use client'

import { useEffect, useState, useRef } from 'react'

const FIREBASE_DB_URL = 'https://newschool-15515-default-rtdb.firebaseio.com'

/**
 * Hook to listen to a Firebase path in real-time using polling
 * Returns the current data and updates automatically when data changes
 */
export function useFirebaseData<T = any>(path: string | null, intervalMs: number = 3000): {
  data: T | null
  loading: boolean
  error: string | null
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!path)
  const [error, setError] = useState<string | null>(null)
  const lastDataRef = useRef<string>('')

  useEffect(() => {
    if (!path) {
      setData(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchData = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        // Only update if data actually changed (compare JSON strings)
        const jsonStr = JSON.stringify(json)
        if (jsonStr !== lastDataRef.current) {
          lastDataRef.current = jsonStr
          if (!cancelled) {
            setData(json)
            setError(null)
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, intervalMs)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [path, intervalMs])

  return { data, loading, error }
}

/**
 * Hook to listen to Firebase broadcasts (real-time notifications)
 * Returns new broadcasts as they arrive
 */
export function useFirebaseBroadcasts(channel: string | null, intervalMs: number = 2000): {
  broadcasts: any[]
  lastBroadcast: any | null
} {
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [lastBroadcast, setLastBroadcast] = useState<any | null>(null)
  const lastKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!channel) return

    let cancelled = false

    const fetchBroadcasts = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/broadcasts/${channel}.json?orderBy="timestamp"&limitToLast=5`)
        if (!res.ok) return
        const json = await res.json()

        if (!json || cancelled) return

        const entries = Object.entries(json).sort(([, a]: any, [, b]: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        if (entries.length > 0) {
          const [latestKey, latestData] = entries[entries.length - 1]
          if (lastKeyRef.current !== latestKey) {
            lastKeyRef.current = latestKey
            if (!cancelled) {
              setLastBroadcast(latestData)
              setBroadcasts(entries.map(([, v]: any) => v))
            }
          }
        }
      } catch {
        // Silent fail for broadcasts
      }
    }

    fetchBroadcasts()
    const interval = setInterval(fetchBroadcasts, intervalMs)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [channel, intervalMs])

  return { broadcasts, lastBroadcast }
}

/**
 * Hook to track online users via Firebase presence
 */
export function useFirebasePresence(userId: string | null, userName: string | null, role: string | null) {
  useEffect(() => {
    if (!userId) return

    // Set user as online
    const setOnline = () => {
      fetch(`${FIREBASE_DB_URL}/presence/${userId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          role,
          online: true,
          lastSeen: new Date().toISOString(),
        }),
      }).catch(() => {})
    }

    // Set user as offline
    const setOffline = () => {
      fetch(`${FIREBASE_DB_URL}/presence/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          online: false,
          lastSeen: new Date().toISOString(),
        }),
      }).catch(() => {})
    }

    setOnline()
    const interval = setInterval(setOnline, 10000) // Update every 10s

    // Set offline on page unload
    window.addEventListener('beforeunload', setOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', setOffline)
      setOffline()
    }
  }, [userId, userName, role])
}

/**
 * Hook to get count of online users
 */
export function useOnlineUsers(intervalMs: number = 5000): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetchCount = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/presence.json`)
        if (!res.ok) return
        const data = await res.json()
        if (!data || cancelled) return

        // Count users who were seen in the last 30 seconds
        const now = Date.now()
        const onlineCount = Object.values(data).filter((u: any) => {
          if (!u?.lastSeen) return false
          return now - new Date(u.lastSeen).getTime() < 30000 && u.online !== false
        }).length

        if (!cancelled) setCount(onlineCount)
      } catch {
        // Silent fail
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, intervalMs)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [intervalMs])

  return count
}
