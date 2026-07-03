import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { destroySession, getSessionCookieName, clearSessionCookie, getCurrentUser } from '@/lib/auth'
import { firebaseSet } from '@/lib/firebase'

export async function POST() {
  try {
    const user = await getCurrentUser()

    const cookieStore = await cookies()
    const token = cookieStore.get(getSessionCookieName())?.value
    if (token) await destroySession(token)
    await clearSessionCookie()

    // Set user offline in Firebase
    if (user) {
      await firebaseSet(`presence/${user.id}`, {
        name: user.name,
        email: user.email,
        role: user.role,
        online: false,
        lastSeen: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
