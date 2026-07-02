import bcrypt from 'bcryptjs'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
}

const SESSION_COOKIE = 'sms_session'
const SESSION_EXPIRY_DAYS = 7

// Session store - persisted globally to survive HMR in development
const globalForSessions = globalThis as unknown as {
  __smsSessions?: Map<string, { user: SessionUser; expires: number }>
}
const sessions = globalForSessions.__smsSessions ?? new Map<string, { user: SessionUser; expires: number }>()
if (process.env.NODE_ENV !== 'production') globalForSessions.__smsSessions = sessions

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = generateToken()
  const expires = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  sessions.set(token, { user, expires })
  return token
}

export function getSession(token?: string): SessionUser | null {
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (session.expires < Date.now()) {
    sessions.delete(token)
    return null
  }
  return session.user
}

export function destroySession(token: string): void {
  sessions.delete(token)
}

// Dynamic import of next/headers keeps this module client-bundle-safe
// (only `hasPermission` / `ROLE_PERMISSIONS` are imported from client components).
// Tree-shaking removes these async functions from client bundles.
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

// Role hierarchy for permission checks
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'], // all permissions
  admin: [
    'student.*', 'teacher.view', 'mark.*', 'rank.*', 'report.*',
    'assignment.*', 'attendance.*', 'promotion.*', 'idcard.*',
    'certificate.*', 'finance.*', 'hr.*', 'library.*', 'profile.edit'
  ],
  teacher: [
    'student.view', 'mark.*', 'rank.*', 'report.*', 'assignment.*',
    'attendance.*', 'promotion.*', 'idcard.*', 'certificate.*', 'profile.edit'
  ],
  student: [
    'mark.view', 'rank.view', 'report.view', 'assignment.submit',
    'attendance.view', 'promotion.view', 'library.*', 'profile.edit'
  ],
  finance: ['finance.*', 'profile.edit'],
  library: ['library.*', 'profile.edit'],
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
