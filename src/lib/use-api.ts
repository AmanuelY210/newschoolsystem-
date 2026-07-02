'use client'

import { useEffect, useState, useCallback, useReducer } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

type FetchAction<T> =
  | { type: 'fetch' }
  | { type: 'success'; data: T }
  | { type: 'error'; error: string }

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  switch (action.type) {
    case 'fetch':
      return { status: 'loading' }
    case 'success':
      return { status: 'success', data: action.data }
    case 'error':
      return { status: 'error', error: action.error }
    default:
      return state
  }
}

export function useApi<T>(url: string | null): UseApiState<T> {
  const [state, dispatch] = useReducer(fetchReducer<T>, { status: url ? 'loading' : 'idle' } as FetchState<T>)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!url) return

    let cancelled = false
    dispatch({ type: 'fetch' })

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Request failed' }))
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((json) => {
        if (!cancelled) {
          dispatch({ type: 'success', data: json })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          dispatch({ type: 'error', error: err.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [url, refreshKey])

  return {
    data: state.status === 'success' ? state.data : null,
    loading: state.status === 'loading',
    error: state.status === 'error' ? state.error : null,
    refetch,
  }
}

export async function apiPost(url: string, body: any, method: string = 'POST') {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

export async function apiDelete(url: string) {
  const res = await fetch(url, { method: 'DELETE' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Delete failed')
  return json
}

export async function apiPut(url: string, body: any) {
  return apiPost(url, body, 'PUT')
}
