import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'teacher.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      teacherId, gradeId, sectionId, subjectId, academicYearId,
      campus, weeklyPeriods, room, status,
    } = body

    const assignment = await db.teacherAssignment.update({
      where: { id },
      data: {
        ...(teacherId !== undefined && { teacherId }),
        ...(gradeId !== undefined && { gradeId }),
        ...(sectionId !== undefined && { sectionId: sectionId || null }),
        ...(subjectId !== undefined && { subjectId }),
        ...(academicYearId !== undefined && { academicYearId: academicYearId || null }),
        ...(campus !== undefined && { campus }),
        ...(weeklyPeriods !== undefined && { weeklyPeriods: Number(weeklyPeriods) }),
        ...(room !== undefined && { room }),
        ...(status !== undefined && { status }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            teacherId: true,
            user: { select: { email: true } },
          },
        },
        grade: { select: { id: true, name: true, level: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ teacherAssignment: assignment })
  } catch (error) {
    console.error('PUT teacher-assignment error:', error)
    return NextResponse.json({ error: 'Failed to update teacher assignment' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'teacher.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.teacherAssignment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE teacher-assignment error:', error)
    return NextResponse.json({ error: 'Failed to delete teacher assignment' }, { status: 500 })
  }
}
