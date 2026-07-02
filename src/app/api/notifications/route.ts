import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/notifications - list notifications for current user
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: any = { userId: user.id }
    if (unreadOnly) where.read = false

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const unreadCount = await db.notification.count({
      where: { userId: user.id, read: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST /api/notifications - create notification
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { userId, title, message, type, link } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Missing required fields (title, message)' }, { status: 400 })
    }

    // Restrict: only super_admin/admin can send notifications to other users
    const targetUserId =
      userId && ['super_admin', 'admin'].includes(user.role)
        ? userId
        : user.id

    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        title,
        message,
        type: type || 'info',
        link: link || null,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('POST /api/notifications error:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}
