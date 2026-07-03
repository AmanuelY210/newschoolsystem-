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
import { AcademicYearModule } from './modules/AcademicYearModule'
import { SemesterModule } from './modules/SemesterModule'
import { GradeModule } from './modules/GradeModule'
import { SectionModule } from './modules/SectionModule'
import { SubjectModule } from './modules/SubjectModule'
import { TeacherAssignmentModule } from './modules/TeacherAssignmentModule'
import { ClassTeacherModule } from './modules/ClassTeacherModule'
import { CurriculumModule } from './modules/CurriculumModule'
import { LessonPlanModule } from './modules/LessonPlanModule'
import { TimetableModule } from './modules/TimetableModule'
import { ExamModule } from './modules/ExamModule'
import { GradingSystemModule } from './modules/GradingSystemModule'
import { AttendanceSettingsModule } from './modules/AttendanceSettingsModule'
import { CalendarModule } from './modules/CalendarModule'
import { HolidaysModule } from './modules/HolidaysModule'
import { LanguageManagementModule } from './modules/LanguageManagementModule'

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
  languages: LanguageManagementModule,
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
  'academic-year': AcademicYearModule,
  semester: SemesterModule,
  grades: GradeModule,
  sections: SectionModule,
  subjects: SubjectModule,
  'teacher-assignment': TeacherAssignmentModule,
  'class-teacher': ClassTeacherModule,
  curriculum: CurriculumModule,
  'lesson-plan': LessonPlanModule,
  timetable: TimetableModule,
  exams: ExamModule,
  'grading-system': GradingSystemModule,
  'attendance-settings': AttendanceSettingsModule,
  'school-calendar': CalendarModule,
  holidays: HolidaysModule,
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
