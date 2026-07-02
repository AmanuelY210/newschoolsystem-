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

export type PublicPage = 'home' | 'about' | 'academy' | 'admissions' | 'media-photos' | 'media-videos' | 'teachers' | 'students' | 'contact'

interface AppState {
  // Auth
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void

  // Navigation
  view: 'public' | 'login' | 'portal'
  publicPage: PublicPage
  portalModule: string
  setView: (view: 'public' | 'login' | 'portal') => void
  setPublicPage: (page: PublicPage) => void
  setPortalModule: (module: string) => void
  navigateToPublic: (page: PublicPage) => void
  navigateToLogin: () => void
  navigateToPortal: (module?: string) => void
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
        set({ user: null, view: 'public', publicPage: 'home', portalModule: 'dashboard' })
      },

      view: 'public',
      publicPage: 'home',
      portalModule: 'dashboard',

      setView: (view) => set({ view }),
      setPublicPage: (publicPage) => set({ publicPage }),
      setPortalModule: (portalModule) => set({ portalModule }),

      navigateToPublic: (page) => set({ view: 'public', publicPage: page }),
      navigateToLogin: () => set({ view: 'login' }),
      navigateToPortal: (module) => set({ view: 'portal', portalModule: module || 'dashboard' }),
    }),
    {
      name: 'sms-app-store',
      partialize: (state) => ({ 
        user: state.user, 
        view: state.user ? state.view : 'public',
        publicPage: state.publicPage,
        portalModule: state.portalModule,
      }),
    }
  )
)
