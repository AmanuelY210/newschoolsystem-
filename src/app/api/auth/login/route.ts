import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'
import { firebaseSet, firebasePush } from '@/lib/firebase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        student: { include: { grade: true, section: true } },
        teacher: true,
      },
    })

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || null,
    }

    const token = await createSession(sessionUser)
    await setSessionCookie(token)

    // Sync user presence to Firebase
    await firebaseSet(`presence/${user.id}`, {
      name: user.name,
      email: user.email,
      role: user.role,
      online: true,
      lastSeen: new Date().toISOString(),
    })

    // Log login event to Firebase
    await firebasePush('events/logins', {
      userId: user.id,
      name: user.name,
      role: user.role,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      user: sessionUser,
      profile: user.student || user.teacher || null,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
