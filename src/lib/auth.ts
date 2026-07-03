import bcrypt from 'bcryptjs'
import { db } from './db'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
}

const SESSION_COOKIE = 'sms_session'
const SESSION_EXPIRY_DAYS = 7

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Database-backed session - persists across server restarts
export async function createSession(user: SessionUser): Promise<string> {
  const token = generateToken()
  const expires = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  await db.session.create({
    data: {
      token,
      userId: user.id,
      expires,
    },
  })
  return token
}

export async function getSession(token?: string): Promise<SessionUser | null> {
  if (!token) return null
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expires < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    avatar: session.user.avatar,
  }
}

export async function destroySession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } }).catch(() => {})
}

// Dynamic import of next/headers keeps this module client-bundle-safe
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return getSession(token)
}

export async function setSessionCookie(token: string) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export function getSessionCookieName() {
  return SESSION_COOKIE
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Role hierarchy for permission checks - Full Role & Permission Structure
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  // 1. Super Admin - Full Control over everything
  super_admin: ['*'],

  // 2. School Admin - Limited Control (own school only, no system settings)
  admin: [
    // Academic Management
    'academicyear.*', 'department.*', 'class.*', 'section.*', 'subject.*',
    'timetable.*', 'exam.*', 'grade.*',
    // Staff Management
    'teacher.*', 'employee.*', 'attendance.*', 'leave.*',
    // Student Management
    'student.*', 'promotion.*', 'certificate.*', 'idcard.*', 'transfer.*',
    // Academic Records
    'mark.*', 'rank.*', 'report.*', 'assignment.*', 'homework.*',
    // Finance (view only)
    'finance.view', 'payroll.view',
    // Library (view only)
    'library.view',
    // HR
    'hr.*',
    // Reports
    'report.student', 'report.attendance', 'report.exam', 'report.fee',
    // Limited settings
    'settings.limited',
    // Profile
    'profile.edit',
  ],

  // 3. Teacher - Assigned classes/subjects only
  teacher: [
    // Academic (assigned only)
    'academicyear.view', 'class.view', 'section.view', 'subject.view',
    'timetable.view',
    // Attendance (manage assigned)
    'attendance.*',
    // Exams & Marks
    'mark.*', 'exam.view', 'rank.*', 'report.*',
    // Assignments & Homework
    'assignment.*', 'homework.*',
    // Students (assigned only, view)
    'student.view',
    // Communication
    'message.student', 'message.parent', 'announcement.*',
    // Reports (limited)
    'report.student', 'report.attendance',
    // ID Card & Certificate
    'idcard.*', 'certificate.*',
    // Profile
    'profile.edit',
  ],

  // 4. Student - Personal access only
  student: [
    // Profile
    'profile.edit', 'profile.view',
    // Academic (view own)
    'subject.view', 'timetable.view', 'attendance.view', 'mark.view',
    'rank.view', 'report.view', 'grade.view', 'result.view',
    // Homework
    'homework.view', 'homework.submit',
    // Finance (view own fees)
    'finance.view', 'fee.status',
    // Library (own books)
    'library.view', 'library.borrow', 'library.renew',
    // Communication
    'message.teacher', 'notice.view',
    // Promotion (view own)
    'promotion.view',
  ],

  // 5. Finance - All financial operations
  finance: [
    // Student Fees
    'finance.*', 'fee.*', 'discount.*', 'fine.*', 'scholarship.*',
    // Payroll
    'payroll.*',
    // Expenses
    'expense.*',
    // Income
    'income.*',
    // Reports (finance)
    'report.finance', 'report.collection', 'report.outstanding',
    'report.profitloss', 'report.cashbook', 'report.balancesheet',
    // Students (fee status only)
    'student.view',
    // Profile
    'profile.edit',
  ],

  // 6. Library - Book management
  library: [
    // Book Management
    'library.*', 'book.*',
    // Book Issue
    'loan.*',
    // Student Library
    'student.view',
    // Reports (library)
    'report.library', 'report.available', 'report.issued',
    'report.overdue', 'report.fine', 'report.lost',
    // Profile
    'profile.edit',
  ],
}

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || []
  if (perms.includes('*')) return true
  // Check wildcard patterns e.g. "student.*" matches "student.view"
  for (const p of perms) {
    if (p === permission) return true
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -2)
      if (permission.startsWith(prefix + '.') || permission === prefix) return true
    }
  }
  return false
}
