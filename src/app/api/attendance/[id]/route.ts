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
    if (!hasPermission(user.role, 'attendance.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await db.attendance.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Attendance not found' }, { status: 404 })

    const attendance = await db.attendance.update({
      where: { id },
      data: {
        studentId: body.studentId,
        teacherId: body.teacherId,
        date: body.date ? new Date(body.date) : undefined,
        status: body.status,
        remarks: body.remarks,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('PUT attendance error:', error)
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'attendance.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const attendance = await db.attendance.findUnique({ where: { id } })
    if (!attendance) return NextResponse.json({ error: 'Attendance not found' }, { status: 404 })

    await db.attendance.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE attendance error:', error)
    return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 })
  }
}
