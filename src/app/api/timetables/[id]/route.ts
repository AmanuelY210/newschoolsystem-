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
    if (!hasPermission(user.role, 'timetable.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      gradeId, sectionId, subjectId, teacherId, dayOfWeek,
      startTime, endTime, room, academicYear,
    } = body

    const timetable = await db.timetable.update({
      where: { id },
      data: {
        ...(gradeId !== undefined && { gradeId }),
        ...(sectionId !== undefined && { sectionId: sectionId || null }),
        ...(subjectId !== undefined && { subjectId }),
        ...(teacherId !== undefined && { teacherId: teacherId || null }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(room !== undefined && { room }),
        ...(academicYear !== undefined && { academicYear }),
      },
      include: {
        grade: true,
        section: true,
        subject: true,
      },
    })

    return NextResponse.json({ timetable })
  } catch (error) {
    console.error('PUT timetable error:', error)
    return NextResponse.json({ error: 'Failed to update timetable' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'timetable.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.timetable.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE timetable error:', error)
    return NextResponse.json({ error: 'Failed to delete timetable' }, { status: 500 })
  }
}
