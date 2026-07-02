'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { PublicSite } from '@/components/public/PublicSite'
import { LoginPage } from '@/components/auth/LoginPage'
import { PortalShell } from '@/components/portal/PortalShell'

export default function Home() {
  const { view, user, setUser, setView } = useAppStore()

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          if (useAppStore.getState().view === 'public' || !useAppStore.getState().view) {
            setView('portal')
          }
        }
      } catch (e) {
        // Not logged in, stay on public
      }
    }
    checkAuth()
  }, [setUser, setView])

  if (view === 'login') {
    return <LoginPage />
  }

  if (view === 'portal' && user) {
    return <PortalShell />
  }

  return <PublicSite />
}
