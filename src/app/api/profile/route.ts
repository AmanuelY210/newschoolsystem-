import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth'

// GET /api/profile - get current user's full profile
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Include role-specific profile
    let profile: any = null
    if (user.role === 'student') {
      profile = await db.student.findUnique({
        where: { userId: user.id },
        include: { grade: true, section: true },
      })
    } else if (user.role === 'teacher') {
      profile = await db.teacher.findUnique({ where: { userId: user.id } })
    } else if (user.role === 'finance') {
      profile = await db.financeStaff.findUnique({ where: { userId: user.id } })
    } else if (user.role === 'library') {
      profile = await db.librarian.findUnique({ where: { userId: user.id } })
    }

    return NextResponse.json({ user: dbUser, profile })
  } catch (error) {
    console.error('GET /api/profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT /api/profile - update own profile (name, phone, address, avatar, password)
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, phone, address, avatar, oldPassword, newPassword } = body

    // Password change requires verification of old password
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }
      const current = await db.user.findUnique({ where: { id: user.id } })
      if (!current) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const valid = await verifyPassword(oldPassword, current.password)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
    }

    const data: any = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (address !== undefined) data.address = address
    if (avatar !== undefined) data.avatar = avatar
    if (newPassword) data.password = await hashPassword(newPassword)

    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
      },
    })

    // Sync name into role-specific table if applicable
    if (name) {
      const [first, ...rest] = name.split(' ')
      const last = rest.join(' ')
      if (user.role === 'student') {
        await db.student.updateMany({
          where: { userId: user.id },
          data: { firstName: first, lastName: last },
        })
      } else if (user.role === 'teacher') {
        await db.teacher.updateMany({
          where: { userId: user.id },
          data: { firstName: first, lastName: last },
        })
      } else if (user.role === 'finance') {
        await db.financeStaff.updateMany({
          where: { userId: user.id },
          data: { firstName: first, lastName: last },
        })
      } else if (user.role === 'library') {
        await db.librarian.updateMany({
          where: { userId: user.id },
          data: { firstName: first, lastName: last },
        })
      }
    }

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('PUT /api/profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
