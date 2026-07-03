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
    if (!hasPermission(user.role, 'subject.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { subjectId, teacherId, title, description, content, date, duration, fileUrl } = body

    const lessonPlan = await db.lessonPlan.update({
      where: { id },
      data: {
        ...(subjectId !== undefined && { subjectId }),
        ...(teacherId !== undefined && { teacherId: teacherId || null }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        ...(duration !== undefined && { duration: duration ? Number(duration) : null }),
        ...(fileUrl !== undefined && { fileUrl }),
      },
      include: {
        subject: { include: { grade: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ lessonPlan })
  } catch (error) {
    console.error('PUT lesson-plan error:', error)
    return NextResponse.json({ error: 'Failed to update lesson plan' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'subject.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.lessonPlan.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE lesson-plan error:', error)
    return NextResponse.json({ error: 'Failed to delete lesson plan' }, { status: 500 })
  }
}
