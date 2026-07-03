import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import bcrypt from 'bcryptjs'

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
        user: { select: { email: true, phone: true, avatar: true, active: true } },
        teacherAssignments: {
          include: {
            grade: true,
            section: true,
            subject: true,
          },
        },
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

    // Handle password reset (admin only)
    if (body.resetPassword && (user.role === 'super_admin' || user.role === 'admin')) {
      const newPassword = body.resetPassword
      const passwordHash = await bcrypt.hash(newPassword, 10)
      await db.user.update({
        where: { id: teacher.userId },
        data: { password: passwordHash },
      })
      return NextResponse.json({ success: true, message: 'Password reset successfully' })
    }

    // Handle assignment updates (admin only)
    if (body.assignments !== undefined && (user.role === 'super_admin' || user.role === 'admin')) {
      // Delete existing assignments
      await db.teacherAssignment.deleteMany({ where: { teacherId: id } })
      // Create new assignments
      if (Array.isArray(body.assignments) && body.assignments.length > 0) {
        for (const a of body.assignments) {
          if (a.gradeId && a.subjectId) {
            await db.teacherAssignment.create({
              data: {
                teacherId: id,
                gradeId: a.gradeId,
                sectionId: a.sectionId || null,
                subjectId: a.subjectId,
                academicYear: a.academicYear || null,
              },
            }).catch(() => {}) // Ignore unique constraint errors
          }
        }
      }
    }

    // Teachers can only update their own profile fields (not status, salary, etc.)
    const canEditAll = user.role === 'super_admin' || user.role === 'admin'

    const updateData: any = {}
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
    if (body.qualification !== undefined) updateData.qualification = body.qualification
    if (body.specialization !== undefined) updateData.specialization = body.specialization
    if (body.experience !== undefined) updateData.experience = Number(body.experience)
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.address !== undefined) updateData.address = body.address
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl
    if (body.academicYear !== undefined) updateData.academicYear = body.academicYear
    if (body.campus !== undefined) updateData.campus = body.campus

    // Only admin can change these
    if (canEditAll) {
      if (body.salary !== undefined) updateData.salary = Number(body.salary)
      if (body.status !== undefined) updateData.status = body.status
    }

    const updated = await db.teacher.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { email: true, phone: true, avatar: true, active: true } },
        teacherAssignments: { include: { grade: true, section: true, subject: true } },
      },
    })

    // Sync user fields
    const userUpdate: any = {}
    if (body.phone !== undefined) userUpdate.phone = body.phone
    if (body.photoUrl !== undefined) userUpdate.avatar = body.photoUrl
    if (body.firstName !== undefined || body.lastName !== undefined) {
      userUpdate.name = `${body.firstName ?? updated.firstName} ${body.lastName ?? updated.lastName}`
    }
    // Admin can activate/deactivate user account
    if (canEditAll && body.status !== undefined) {
      userUpdate.active = body.status === 'active'
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
