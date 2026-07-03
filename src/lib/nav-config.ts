import { UserRole } from './store'
import {
  LayoutDashboard, Users, GraduationCap, ClipboardList, Award, FileText,
  BookOpen, CheckSquare, TrendingUp, IdCard, ScrollText, DollarSign,
  UserCog, Library, Settings, Globe, Image, Video, FileBarChart,
  Bell, Calendar, UserPlus, BookMarked, CreditCard, Send, Eye,
  Building2, School, CalendarDays, ClipboardCheck, MessageSquare,
  Megaphone, Wallet, Receipt, PiggyBank, BarChart3, BookCopy,
  FileSpreadsheet, Database, ShieldCheck, ClipboardPaste,
  CalendarRange, Layers, GitBranch, BookText, BookMarked as BookMarkedIcon,
  ClipboardList as ClipboardListIcon, GraduationCap as GradIcon,
  Scale, CalendarClock, PartyPopper, SlidersHorizontal, Wrench,
  ChevronDown, UserCheck, FileBarChart as FileBarChartIcon,
  Languages,
} from 'lucide-react'

export interface NavModule {
  id: string
  label: string
  icon: any
  permission?: string
}

export interface NavGroup {
  id: string
  label: string
  icon: any
  modules: NavModule[]
}

export interface NavItem {
  type: 'module' | 'group'
  module?: NavModule
  group?: NavGroup
}

// =====================================================
// ACADEMIC TOOLS - Shared between Super Admin & School Admin
// =====================================================
const ACADEMIC_TOOLS_MODULES: NavModule[] = [
  { id: 'academic-year', label: 'Academic Year', icon: CalendarRange },
  { id: 'semester', label: 'Semester / Term', icon: CalendarClock },
  { id: 'grades', label: 'Grade (Class)', icon: Layers },
  { id: 'sections', label: 'Section', icon: BookCopy },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'teacher-assignment', label: 'Teacher Assignment', icon: UserCheck },
  { id: 'class-teacher', label: 'Class Teacher', icon: GraduationCap },
  { id: 'promotions', label: 'Student Promotion', icon: TrendingUp },
  { id: 'curriculum', label: 'Curriculum', icon: BookText },
  { id: 'lesson-plan', label: 'Lesson Plan', icon: ClipboardListIcon },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'exams', label: 'Exams', icon: ClipboardCheck },
  { id: 'grading-system', label: 'Grading System', icon: Scale },
  { id: 'attendance-settings', label: 'Attendance Settings', icon: SlidersHorizontal },
  { id: 'school-calendar', label: 'School Calendar', icon: Calendar },
  { id: 'holidays', label: 'Holidays', icon: PartyPopper },
  { id: 'events', label: 'Events', icon: Megaphone },
  { id: 'reports', label: 'Reports', icon: FileBarChartIcon },
]

// =====================================================
// ROLE & PERMISSION STRUCTURE
// =====================================================
// 1. Super Admin  - Full Control (all modules + Academic Tools for all schools)
// 2. School Admin - Limited Control (academic tools for own school, no system settings)
// 3. Teacher      - Assigned classes/subjects (attendance, marks, homework)
// 4. Student      - Personal access (view own data, submit homework)
// 5. Finance      - All financial operations (fees, payroll, expenses, reports)
// 6. Library      - Book management (issue, return, fines, reports)
// =====================================================

export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  // ========== 1. SUPER ADMIN - Full Control ==========
  super_admin: [
    { type: 'module', module: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } },
    { type: 'module', module: { id: 'website-cms', label: 'Website CMS', icon: Globe } },
    { type: 'module', module: { id: 'website-settings', label: 'Website Settings', icon: Settings } },
    { type: 'module', module: { id: 'languages', label: 'Language Management', icon: Languages } },
    { type: 'module', module: { id: 'schools', label: 'Schools', icon: Building2 } },
    {
      type: 'group',
      group: {
        id: 'academic-tools',
        label: 'Academic Tools',
        icon: Wrench,
        modules: ACADEMIC_TOOLS_MODULES,
      }
    },
    { type: 'module', module: { id: 'students', label: 'Students', icon: UserPlus, permission: 'student.*' } },
    { type: 'module', module: { id: 'teachers', label: 'Teachers', icon: GraduationCap, permission: 'teacher.*' } },
    { type: 'module', module: { id: 'hr', label: 'Human Resource', icon: UserCog, permission: 'hr.*' } },
    { type: 'module', module: { id: 'marks', label: 'Marks & Grades', icon: ClipboardList, permission: 'mark.*' } },
    { type: 'module', module: { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' } },
    { type: 'module', module: { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' } },
    { type: 'module', module: { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' } },
    { type: 'module', module: { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' } },
    { type: 'module', module: { id: 'finance', label: 'Finance', icon: DollarSign, permission: 'finance.*' } },
    { type: 'module', module: { id: 'library', label: 'Library', icon: Library, permission: 'library.*' } },
    { type: 'module', module: { id: 'registrations', label: 'Online Applications', icon: FileBarChart } },
    { type: 'module', module: { id: 'messages', label: 'Contact Messages', icon: Bell } },
    { type: 'module', module: { id: 'profile', label: 'My Profile', icon: UserCog } },
  ],

  // ========== 2. SCHOOL ADMIN - Limited Control ==========
  admin: [
    { type: 'module', module: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } },
    {
      type: 'group',
      group: {
        id: 'academic-tools',
        label: 'Academic Tools',
        icon: Wrench,
        modules: ACADEMIC_TOOLS_MODULES,
      }
    },
    { type: 'module', module: { id: 'students', label: 'Student Admission', icon: UserPlus, permission: 'student.*' } },
    { type: 'module', module: { id: 'teachers', label: 'Teachers', icon: GraduationCap, permission: 'teacher.*' } },
    { type: 'module', module: { id: 'hr', label: 'Human Resource', icon: UserCog, permission: 'hr.*' } },
    { type: 'module', module: { id: 'marks', label: 'Marks & Grades', icon: ClipboardList, permission: 'mark.*' } },
    { type: 'module', module: { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' } },
    { type: 'module', module: { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' } },
    { type: 'module', module: { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' } },
    { type: 'module', module: { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' } },
    { type: 'module', module: { id: 'finance', label: 'Finance (View)', icon: Eye, permission: 'finance.view' } },
    { type: 'module', module: { id: 'library', label: 'Library (View)', icon: Eye, permission: 'library.view' } },
    { type: 'module', module: { id: 'registrations', label: 'Online Applications', icon: FileBarChart } },
    { type: 'module', module: { id: 'messages', label: 'Contact Messages', icon: Bell } },
    { type: 'module', module: { id: 'profile', label: 'My Profile', icon: UserCog } },
  ],

  // ========== 3. TEACHER - Assigned Classes/Subjects ==========
  teacher: [
    { type: 'module', module: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } },
    { type: 'module', module: { id: 'students', label: 'My Students', icon: Users, permission: 'student.view' } },
    { type: 'module', module: { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' } },
    { type: 'module', module: { id: 'marks', label: 'Marks Entry', icon: ClipboardList, permission: 'mark.*' } },
    { type: 'module', module: { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' } },
    { type: 'module', module: { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' } },
    { type: 'module', module: { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' } },
    { type: 'module', module: { id: 'events', label: 'Events', icon: Calendar } },
    { type: 'module', module: { id: 'profile', label: 'My Profile', icon: UserCog } },
  ],

  // ========== 4. STUDENT - Personal Access ==========
  student: [
    { type: 'module', module: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } },
    { type: 'module', module: { id: 'marks', label: 'My Marks', icon: Eye, permission: 'mark.view' } },
    { type: 'module', module: { id: 'ranks', label: 'My Rank', icon: Award, permission: 'rank.view' } },
    { type: 'module', module: { id: 'reports', label: 'My Reports', icon: FileText, permission: 'report.view' } },
    { type: 'module', module: { id: 'assignments', label: 'Homework', icon: Send, permission: 'homework.submit' } },
    { type: 'module', module: { id: 'attendance', label: 'My Attendance', icon: CheckSquare, permission: 'attendance.view' } },
    { type: 'module', module: { id: 'promotions', label: 'My Promotion', icon: TrendingUp, permission: 'promotion.view' } },
    { type: 'module', module: { id: 'finance', label: 'Fee Status', icon: Eye, permission: 'finance.view' } },
    { type: 'module', module: { id: 'library', label: 'Library', icon: Library, permission: 'library.view' } },
    { type: 'module', module: { id: 'profile', label: 'My Profile', icon: UserCog } },
  ],

  // ========== 5. FINANCE - Financial Operations ==========
  finance: [
    { type: 'module', module: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } },
    { type: 'module', module: { id: 'finance', label: 'Finance Management', icon: CreditCard, permission: 'finance.*' } },
    { type: 'module', module: { id: 'students', label: 'Students (Fees)', icon: Users, permission: 'student.view' } },
    { type: 'module', module: { id: 'profile', label: 'My Profile', icon: UserCog } },
  ],

  // ========== 6. LIBRARY - Book Management ==========
  library: [
    { type: 'module', module: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } },
    { type: 'module', module: { id: 'library', label: 'Library Management', icon: BookMarked, permission: 'library.*' } },
    { type: 'module', module: { id: 'students', label: 'Students', icon: Users, permission: 'student.view' } },
    { type: 'module', module: { id: 'profile', label: 'My Profile', icon: UserCog } },
  ],
}

// Backward compatibility: flatten ROLE_NAV into ROLE_MODULES
export const ROLE_MODULES: Record<UserRole, NavModule[]> = Object.fromEntries(
  Object.entries(ROLE_NAV).map(([role, items]) => [
    role,
    items.flatMap((item) => {
      if (item.type === 'module' && item.module) return [item.module]
      if (item.type === 'group' && item.group) return item.group.modules
      return []
    })
  ])
) as Record<UserRole, NavModule[]>

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  finance: 'Finance Officer',
  library: 'Librarian',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-600',
  admin: 'bg-teal-600',
  teacher: 'bg-orange-600',
  student: 'bg-blue-600',
  finance: 'bg-green-600',
  library: 'bg-amber-600',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full system control - manages all schools, users, and system settings',
  admin: 'Manages one school - academics, staff, students, and reports',
  teacher: 'Manages assigned classes - attendance, marks, homework, and communication',
  student: 'Personal access - views own academic info, results, fees, and library',
  finance: 'Manages all financial operations - fees, payroll, expenses, and reports',
  library: 'Manages library - books, borrowing, returns, fines, and reports',
}
