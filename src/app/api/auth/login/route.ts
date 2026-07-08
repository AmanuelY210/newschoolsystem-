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
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isActive = user.active === true || user.active === 'true' || user.active === undefined || user.active === null
    if (!isActive) {
      return NextResponse.json({ error: 'Account is disabled. Contact administrator.' }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date().toISOString(), active: true },
    })

    // Fetch student or teacher profile separately
    let profile = null
    if (user.role === 'student') {
      profile = await db.student.findFirst({ where: { userId: user.id }, include: { grade: true, section: true } })
    } else if (user.role === 'teacher') {
      profile = await db.teacher.findFirst({ where: { userId: user.id } })
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || null,
    }

    const token = await createSession(sessionUser)
    await setSessionCookie(token)

    // Sync to Firebase
    await firebaseSet(`presence/${user.id}`, {
      name: user.name,
      email: user.email,
      role: user.role,
      online: true,
      lastSeen: new Date().toISOString(),
    }).catch(() => {})

    await firebasePush('events/logins', {
      userId: user.id,
      name: user.name,
      role: user.role,
      timestamp: new Date().toISOString(),
    }).catch(() => {})

    return NextResponse.json({
      user: sessionUser,
      profile: profile || null,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
