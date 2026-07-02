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
    const assignment = await db.assignment.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
        submissions: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
          },
        },
      },
    })

    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('GET assignment error:', error)
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'assignment.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await db.assignment.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    const assignment = await db.assignment.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        subjectId: body.subjectId,
        teacherId: body.teacherId,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        maxScore: body.maxScore !== undefined ? Number(body.maxScore) : undefined,
        status: body.status,
      },
      include: {
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('PUT assignment error:', error)
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'assignment.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const assignment = await db.assignment.findUnique({ where: { id } })
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    await db.assignment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE assignment error:', error)
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
}
