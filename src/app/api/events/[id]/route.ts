import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/events/[id] - update event (super_admin or admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const body = await req.json()
    const event = await db.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        location: body.location,
        type: body.type,
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/events/[id] - delete event (super_admin or admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    await db.event.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
