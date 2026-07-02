import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const teacher = await db.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true, avatar: true } },
        marks: { include: { subject: true, student: true }, take: 50, orderBy: { createdAt: 'desc' } },
        assignments: { take: 20, orderBy: { createdAt: 'desc' } },
        attendance: { take: 30, orderBy: { date: 'desc' } },
      },
    })

    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    return NextResponse.json({ teacher })
  } catch (error) {
    console.error('GET teacher error:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Allow teacher to edit own profile (teacher role has profile.edit),
    // or anyone with explicit teacher.edit permission
    const teacher = await db.teacher.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    const isOwner = teacher.userId === user.id
    if (!isOwner && !hasPermission(user.role, 'teacher.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const updated = await db.teacher.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        qualification: body.qualification,
        specialization: body.specialization,
        experience: body.experience !== undefined ? Number(body.experience) : undefined,
        phone: body.phone,
        address: body.address,
        salary: body.salary !== undefined ? Number(body.salary) : undefined,
        photoUrl: body.photoUrl,
        status: body.status,
      },
      include: { user: { select: { email: true, phone: true, avatar: true } } },
    })

    // Optionally update related user phone / avatar / name
    const userUpdate: any = {}
    if (body.phone !== undefined) userUpdate.phone = body.phone
    if (body.photoUrl !== undefined) userUpdate.avatar = body.photoUrl
    if (body.firstName !== undefined || body.lastName !== undefined) {
      userUpdate.name = `${body.firstName ?? updated.firstName} ${body.lastName ?? updated.lastName}`
    }
    if (Object.keys(userUpdate).length > 0) {
      await db.user.update({ where: { id: teacher.userId }, data: userUpdate })
    }

    return NextResponse.json({ teacher: updated })
  } catch (error) {
    console.error('PUT teacher error:', error)
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Only super_admin or admin can delete
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const teacher = await db.teacher.findUnique({ where: { id } })
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    await db.teacher.delete({ where: { id } })
    await db.user.delete({ where: { id: teacher.userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE teacher error:', error)
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 })
  }
}
