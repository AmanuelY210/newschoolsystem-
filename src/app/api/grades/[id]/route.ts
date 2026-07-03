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
    const grade = await db.grade.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { name: 'asc' } },
        subjects: { orderBy: { name: 'asc' } },
      },
    })

    if (!grade) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ grade })
  } catch (error) {
    console.error('GET grade error:', error)
    return NextResponse.json({ error: 'Failed to fetch grade' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'class.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, code, level, educationLevel, description, status } = body

    const grade = await db.grade.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code: code || null }),
        ...(level !== undefined && { level: Number(level) }),
        ...(educationLevel !== undefined && { educationLevel }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ grade })
  } catch (error) {
    console.error('PUT grade error:', error)
    return NextResponse.json({ error: 'Failed to update grade' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'class.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.grade.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE grade error:', error)
    return NextResponse.json({ error: 'Failed to delete grade' }, { status: 500 })
  }
}
