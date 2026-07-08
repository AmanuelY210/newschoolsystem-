'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { LoginPage } from '@/components/auth/LoginPage'
import { PortalShell } from '@/components/portal/PortalShell'

export default function Home() {
  const { view, user, setUser, setView } = useAppStore()

  // Check auth state on mount - go straight to login or portal
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          setView('portal')
        } else {
          setView('login')
        }
      } catch (e) {
        setView('login')
      }
    }
    checkAuth()
  }, [setUser, setView])

  if (view === 'portal' && user) {
    return <PortalShell />
  }

  return <LoginPage />
}
