import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { destroySession, getSessionCookieName, clearSessionCookie } from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(getSessionCookieName())?.value
    if (token) destroySession(token)
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
