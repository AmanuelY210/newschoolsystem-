import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Get full profile
    const profile = await db.user.findUnique({
      where: { id: user.id },
      include: {
        student: { include: { grade: true, section: true } },
        teacher: true,
      },
    })

    return NextResponse.json({ user, profile })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ user: null })
  }
}
