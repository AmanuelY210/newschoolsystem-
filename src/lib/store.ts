'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'finance' | 'library'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string | null
}

export type PublicPage = 'home'

interface AppState {
  // Auth
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void

  // Navigation
  view: 'login' | 'portal'
  portalModule: string
  setView: (view: 'login' | 'portal') => void
  setPortalModule: (module: string) => void
  navigateToLogin: () => void
  navigateToPortal: (module?: string) => void

  // Real-time update trigger
  updateTrigger: number
  triggerUpdate: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
          console.error('Logout error:', e)
        }
        set({ user: null, view: 'login', portalModule: 'dashboard' })
      },

      view: 'login',
      portalModule: 'dashboard',

      setView: (view) => set({ view }),
      setPortalModule: (portalModule) => set({ portalModule }),

      navigateToLogin: () => set({ view: 'login' }),
      navigateToPortal: (module) => set({ view: 'portal', portalModule: module || 'dashboard' }),

      // Real-time update trigger
      updateTrigger: 0,
      triggerUpdate: () => set((state) => ({ updateTrigger: state.updateTrigger + 1 })),
    }),
    {
      name: 'sms-app-store',
      partialize: (state) => ({
        user: state.user,
        view: state.user ? state.view : 'login',
        portalModule: state.portalModule,
      }),
    }
  )
)
