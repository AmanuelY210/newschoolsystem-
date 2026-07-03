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
    if (!hasPermission(user.role, 'section.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, gradeId, capacity, roomNumber, classTeacherId, status } = body

    const section = await db.section.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(gradeId !== undefined && { gradeId }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(roomNumber !== undefined && { roomNumber }),
        ...(classTeacherId !== undefined && { classTeacherId: classTeacherId || null }),
        ...(status !== undefined && { status }),
      },
      include: { grade: { select: { id: true, name: true, level: true } } },
    })

    return NextResponse.json({ section })
  } catch (error) {
    console.error('PUT section error:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'section.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.section.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE section error:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}
