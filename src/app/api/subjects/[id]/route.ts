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
    const subject = await db.subject.findUnique({
      where: { id },
      include: { grade: true },
    })

    if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ subject })
  } catch (error) {
    console.error('GET subject error:', error)
    return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 })
  }
}

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
    const { name, code, gradeId, creditHours, passingMarks, totalMarks, status } = body

    const subject = await db.subject.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(gradeId !== undefined && { gradeId: gradeId || null }),
        ...(creditHours !== undefined && { creditHours: Number(creditHours) }),
        ...(passingMarks !== undefined && { passingMarks: Number(passingMarks) }),
        ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
        ...(status !== undefined && { status }),
      },
      include: { grade: { select: { id: true, name: true, level: true } } },
    })

    return NextResponse.json({ subject })
  } catch (error) {
    console.error('PUT subject error:', error)
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 })
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
    await db.subject.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE subject error:', error)
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 })
  }
}
