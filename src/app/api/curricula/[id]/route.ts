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
    const { academicYearId, subjectId, title, description, topics, objectives } = body

    const curriculum = await db.curriculum.update({
      where: { id },
      data: {
        ...(academicYearId !== undefined && { academicYearId: academicYearId || null }),
        ...(subjectId !== undefined && { subjectId }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(topics !== undefined && { topics }),
        ...(objectives !== undefined && { objectives }),
      },
      include: {
        subject: { include: { grade: true } },
        academicYear: true,
      },
    })

    return NextResponse.json({ curriculum })
  } catch (error) {
    console.error('PUT curriculum error:', error)
    return NextResponse.json({ error: 'Failed to update curriculum' }, { status: 500 })
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
    await db.curriculum.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE curriculum error:', error)
    return NextResponse.json({ error: 'Failed to delete curriculum' }, { status: 500 })
  }
}
