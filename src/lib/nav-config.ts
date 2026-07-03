import { UserRole } from './store'
import {
  LayoutDashboard, Users, GraduationCap, ClipboardList, Award, FileText,
  BookOpen, CheckSquare, TrendingUp, IdCard, ScrollText, DollarSign,
  UserCog, Library, Settings, Globe, Image, Video, FileBarChart,
  Bell, Calendar, UserPlus, BookMarked, CreditCard, Send, Eye,
  Building2, School, CalendarDays, ClipboardCheck, MessageSquare,
  Megaphone, Wallet, Receipt, PiggyBank, BarChart3, BookCopy,
  FileSpreadsheet, Database, ShieldCheck, ClipboardPaste
} from 'lucide-react'

export interface NavModule {
  id: string
  label: string
  icon: any
  permission?: string
}

// =====================================================
// ROLE & PERMISSION STRUCTURE
// =====================================================
// 1. Super Admin  - Full Control (all modules)
// 2. School Admin - Limited Control (academic, staff, students, no system settings)
// 3. Teacher      - Assigned classes/subjects (attendance, marks, homework)
// 4. Student      - Personal access (view own data, submit homework)
// 5. Finance      - All financial operations (fees, payroll, expenses, reports)
// 6. Library      - Book management (issue, return, fines, reports)
// =====================================================

export const ROLE_MODULES: Record<UserRole, NavModule[]> = {
  // ========== 1. SUPER ADMIN - Full Control ==========
  super_admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Website Management
    { id: 'website-cms', label: 'Website CMS', icon: Globe },
    { id: 'website-settings', label: 'Website Settings', icon: Settings },
    // School Management
    { id: 'schools', label: 'Schools', icon: Building2 },
    // Academic Management
    { id: 'students', label: 'Students', icon: UserPlus, permission: 'student.*' },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap, permission: 'teacher.*' },
    { id: 'hr', label: 'Human Resource', icon: UserCog, permission: 'hr.*' },
    { id: 'marks', label: 'Marks & Grades', icon: ClipboardList, permission: 'mark.*' },
    { id: 'ranks', label: 'Rank', icon: Award, permission: 'rank.*' },
    { id: 'reports', label: 'Reports', icon: FileText, permission: 'report.*' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' },
    { id: 'promotions', label: 'Promotion', icon: TrendingUp, permission: 'promotion.*' },
    { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' },
    { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' },
    { id: 'events', label: 'Events', icon: Calendar },
    // Finance
    { id: 'finance', label: 'Finance', icon: DollarSign, permission: 'finance.*' },
    // Library
    { id: 'library', label: 'Library', icon: Library, permission: 'library.*' },
    // Admissions & Communication
    { id: 'registrations', label: 'Online Applications', icon: FileBarChart },
    { id: 'messages', label: 'Contact Messages', icon: Bell },
    // System
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],

  // ========== 2. SCHOOL ADMIN - Limited Control ==========
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Academic Management
    { id: 'students', label: 'Student Admission', icon: UserPlus, permission: 'student.*' },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap, permission: 'teacher.*' },
    { id: 'hr', label: 'Human Resource', icon: UserCog, permission: 'hr.*' },
    { id: 'marks', label: 'Marks & Grades', icon: ClipboardList, permission: 'mark.*' },
    { id: 'ranks', label: 'Rank', icon: Award, permission: 'rank.*' },
    { id: 'reports', label: 'Reports', icon: FileText, permission: 'report.*' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' },
    { id: 'promotions', label: 'Promotion', icon: TrendingUp, permission: 'promotion.*' },
    { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' },
    { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' },
    { id: 'events', label: 'Events', icon: Calendar },
    // Finance (view only)
    { id: 'finance', label: 'Finance (View)', icon: Eye, permission: 'finance.view' },
    // Library (view only)
    { id: 'library', label: 'Library (View)', icon: Eye, permission: 'library.view' },
    // Admissions & Communication
    { id: 'registrations', label: 'Online Applications', icon: FileBarChart },
    { id: 'messages', label: 'Contact Messages', icon: Bell },
    // Profile
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],

  // ========== 3. TEACHER - Assigned Classes/Subjects ==========
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Academic (assigned)
    { id: 'students', label: 'My Students', icon: Users, permission: 'student.view' },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' },
    { id: 'marks', label: 'Marks Entry', icon: ClipboardList, permission: 'mark.*' },
    { id: 'ranks', label: 'Rank', icon: Award, permission: 'rank.*' },
    { id: 'reports', label: 'Reports', icon: FileText, permission: 'report.*' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' },
    { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' },
    { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' },
    { id: 'events', label: 'Events', icon: Calendar },
    // Profile
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],

  // ========== 4. STUDENT - Personal Access ==========
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // Academic (view own)
    { id: 'marks', label: 'My Marks', icon: Eye, permission: 'mark.view' },
    { id: 'ranks', label: 'My Rank', icon: Award, permission: 'rank.view' },
    { id: 'reports', label: 'My Reports', icon: FileText, permission: 'report.view' },
    { id: 'assignments', label: 'Homework', icon: Send, permission: 'homework.submit' },
    { id: 'attendance', label: 'My Attendance', icon: CheckSquare, permission: 'attendance.view' },
    { id: 'promotions', label: 'My Promotion', icon: TrendingUp, permission: 'promotion.view' },
    // Finance (view own fees)
    { id: 'finance', label: 'Fee Status', icon: Eye, permission: 'finance.view' },
    // Library
    { id: 'library', label: 'Library', icon: Library, permission: 'library.view' },
    // Profile
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],

  // ========== 5. FINANCE - Financial Operations ==========
  finance: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Finance Management', icon: CreditCard, permission: 'finance.*' },
    { id: 'students', label: 'Students (Fees)', icon: Users, permission: 'student.view' },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],

  // ========== 6. LIBRARY - Book Management ==========
  library: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Library Management', icon: BookMarked, permission: 'library.*' },
    { id: 'students', label: 'Students', icon: Users, permission: 'student.view' },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],
}

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
