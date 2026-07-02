import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/contact/[id] - update message (reply, status) - admin/super_admin only
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
    const existing = await db.contactMessage.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

    const body = await req.json()

    // If reply is provided, set repliedById and mark as 'replied'
    const newStatus = body.reply && !body.status ? 'replied' : body.status || existing.status

    const message = await db.contactMessage.update({
      where: { id },
      data: {
        reply: body.reply !== undefined ? body.reply : existing.reply,
        status: newStatus,
        repliedById: body.reply ? user.id : existing.repliedById,
      },
      include: {
        repliedBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('PUT /api/contact/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}
