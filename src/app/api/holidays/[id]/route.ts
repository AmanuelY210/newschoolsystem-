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
    if (!hasPermission(user.role, 'academicyear.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, date, type, description } = body

    const holiday = await db.holiday.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
      },
    })

    return NextResponse.json({ holiday })
  } catch (error) {
    console.error('PUT holiday error:', error)
    return NextResponse.json({ error: 'Failed to update holiday' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'academicyear.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.holiday.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE holiday error:', error)
    return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 })
  }
}
