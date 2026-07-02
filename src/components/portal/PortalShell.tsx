'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { PortalLayout } from './layout/PortalLayout'
import { DashboardModule } from './modules/DashboardModule'
import { StudentsModule } from './modules/StudentsModule'
import { TeachersModule } from './modules/TeachersModule'
import { MarksModule } from './modules/MarksModule'
import { AttendanceModule } from './modules/AttendanceModule'
import { AssignmentsModule } from './modules/AssignmentsModule'
import { FinanceModule } from './modules/FinanceModule'
import { LibraryModule } from './modules/LibraryModule'
import { WebsiteCmsModule } from './modules/WebsiteCmsModule'
import { WebsiteSettingsModule } from './modules/WebsiteSettingsModule'
import { RanksModule } from './modules/RanksModule'
import { ReportsModule } from './modules/ReportsModule'
import { PromotionsModule } from './modules/PromotionsModule'
import { IdCardsModule } from './modules/IdCardsModule'
import { CertificatesModule } from './modules/CertificatesModule'
import { HrModule } from './modules/HrModule'
import { RegistrationsModule } from './modules/RegistrationsModule'
import { MessagesModule } from './modules/MessagesModule'
import { EventsModule } from './modules/EventsModule'
import { ProfileModule } from './modules/ProfileModule'

const MODULE_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: DashboardModule,
  students: StudentsModule,
  teachers: TeachersModule,
  marks: MarksModule,
  attendance: AttendanceModule,
  assignments: AssignmentsModule,
  finance: FinanceModule,
  library: LibraryModule,
  'website-cms': WebsiteCmsModule,
  'website-settings': WebsiteSettingsModule,
  ranks: RanksModule,
  reports: ReportsModule,
  promotions: PromotionsModule,
  idcards: IdCardsModule,
  certificates: CertificatesModule,
  hr: HrModule,
  registrations: RegistrationsModule,
  messages: MessagesModule,
  events: EventsModule,
  profile: ProfileModule,
}

export function PortalShell() {
  const { user, portalModule } = useAppStore()

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      useAppStore.getState().navigateToLogin()
    }
  }, [user])

  if (!user) return null

  const ModuleComponent = MODULE_COMPONENTS[portalModule] || DashboardModule

  return (
    <PortalLayout>
      <ModuleComponent />
    </PortalLayout>
  )
}
