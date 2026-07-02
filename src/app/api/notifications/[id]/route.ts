import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/notifications/[id] - mark as read
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.notification.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Notification not found' }, { status: 404 })

    // Only the owner or an admin can update the notification
    if (existing.userId !== user.id && !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const read = body.read !== undefined ? Boolean(body.read) : true

    const notification = await db.notification.update({
      where: { id },
      data: { read },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('PUT /api/notifications/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
