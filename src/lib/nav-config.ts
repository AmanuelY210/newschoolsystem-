import { UserRole } from './store'
import {
  LayoutDashboard, Users, GraduationCap, ClipboardList, Award, FileText,
  BookOpen, CheckSquare, TrendingUp, IdCard, ScrollText, DollarSign,
  UserCog, Library, Settings, Globe, Image, Video, FileBarChart,
  Bell, Calendar, UserPlus, BookMarked, CreditCard, Send, Eye
} from 'lucide-react'

export interface NavModule {
  id: string
  label: string
  icon: any
  permission?: string
}

export const ROLE_MODULES: Record<UserRole, NavModule[]> = {
  super_admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'website-cms', label: 'Website CMS', icon: Globe, permission: 'cms.*' },
    { id: 'website-settings', label: 'Website Settings', icon: Settings },
    { id: 'students', label: 'Student Registration', icon: UserPlus, permission: 'student.*' },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap, permission: 'teacher.view' },
    { id: 'marks', label: 'Marks', icon: ClipboardList, permission: 'mark.*' },
    { id: 'ranks', label: 'Rank', icon: Award, permission: 'rank.*' },
    { id: 'reports', label: 'Reports', icon: FileText, permission: 'report.*' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' },
    { id: 'promotions', label: 'Promotion', icon: TrendingUp, permission: 'promotion.*' },
    { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' },
    { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' },
    { id: 'finance', label: 'Finance', icon: DollarSign, permission: 'finance.*' },
    { id: 'hr', label: 'Human Resource', icon: UserCog, permission: 'hr.*' },
    { id: 'library', label: 'Library', icon: Library, permission: 'library.*' },
    { id: 'registrations', label: 'Online Applications', icon: FileBarChart },
    { id: 'messages', label: 'Contact Messages', icon: Bell },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Registration', icon: UserPlus, permission: 'student.*' },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap, permission: 'teacher.view' },
    { id: 'marks', label: 'Marks', icon: ClipboardList, permission: 'mark.*' },
    { id: 'ranks', label: 'Rank', icon: Award, permission: 'rank.*' },
    { id: 'reports', label: 'Reports', icon: FileText, permission: 'report.*' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' },
    { id: 'promotions', label: 'Promotion', icon: TrendingUp, permission: 'promotion.*' },
    { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' },
    { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' },
    { id: 'finance', label: 'Finance', icon: DollarSign, permission: 'finance.*' },
    { id: 'hr', label: 'Human Resource', icon: UserCog, permission: 'hr.*' },
    { id: 'library', label: 'Library', icon: Library, permission: 'library.*' },
    { id: 'registrations', label: 'Online Applications', icon: FileBarChart },
    { id: 'messages', label: 'Contact Messages', icon: Bell },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Registration', icon: UserPlus, permission: 'student.view' },
    { id: 'marks', label: 'Marks', icon: ClipboardList, permission: 'mark.*' },
    { id: 'ranks', label: 'Rank', icon: Award, permission: 'rank.*' },
    { id: 'reports', label: 'Reports', icon: FileText, permission: 'report.*' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, permission: 'assignment.*' },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, permission: 'attendance.*' },
    { id: 'promotions', label: 'Promotion', icon: TrendingUp, permission: 'promotion.*' },
    { id: 'idcards', label: 'ID Card', icon: IdCard, permission: 'idcard.*' },
    { id: 'certificates', label: 'Certificate', icon: ScrollText, permission: 'certificate.*' },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marks', label: 'My Marks', icon: Eye, permission: 'mark.view' },
    { id: 'ranks', label: 'My Rank', icon: Award, permission: 'rank.view' },
    { id: 'reports', label: 'My Reports', icon: FileText, permission: 'report.view' },
    { id: 'assignments', label: 'Assignments', icon: Send, permission: 'assignment.submit' },
    { id: 'attendance', label: 'My Attendance', icon: CheckSquare, permission: 'attendance.view' },
    { id: 'promotions', label: 'My Promotion', icon: TrendingUp, permission: 'promotion.view' },
    { id: 'library', label: 'Library', icon: Library, permission: 'library.*' },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],
  finance: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Finance Management', icon: CreditCard, permission: 'finance.*' },
    { id: 'students', label: 'Students', icon: Users, permission: 'student.view' },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],
  library: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Library Management', icon: BookMarked, permission: 'library.*' },
    { id: 'students', label: 'Students', icon: Users, permission: 'student.view' },
    { id: 'profile', label: 'My Profile', icon: UserCog },
  ],
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
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
