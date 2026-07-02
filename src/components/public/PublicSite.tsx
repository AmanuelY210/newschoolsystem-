'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { AcademyPage } from './pages/AcademyPage'
import { AdmissionsPage } from './pages/AdmissionsPage'
import { AdmissionPortalPage } from './pages/AdmissionPortalPage'
import { TrackApplicationPage } from './pages/TrackApplicationPage'
import { MediaPage } from './pages/MediaPage'
import { TeachersPage } from './pages/TeachersPage'
import { StudentsPage } from './pages/StudentsPage'
import { ContactPage } from './pages/ContactPage'

export function PublicSite() {
  const { publicPage } = useAppStore()

  // Scroll to top whenever the public page changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [publicPage])

  const renderPage = () => {
    switch (publicPage) {
      case 'home':
        return <HomePage />
      case 'about':
        return <AboutPage />
      case 'academy':
        return <AcademyPage />
      case 'admissions':
        return <AdmissionsPage />
      case 'admission-portal':
        return <AdmissionPortalPage />
      case 'track':
        return <TrackApplicationPage />
      case 'media-photos':
        return <MediaPage key="photo" type="photo" />
      case 'media-videos':
        return <MediaPage key="video" type="video" />
      case 'teachers':
        return <TeachersPage />
      case 'students':
        return <StudentsPage />
      case 'contact':
        return <ContactPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">{renderPage()}</main>
      <PublicFooter />
    </div>
  )
}
