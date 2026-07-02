import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/social/[id] - update social link (super_admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.socialLink.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Social link not found' }, { status: 404 })

    const body = await req.json()
    const link = await db.socialLink.update({
      where: { id },
      data: {
        platform: body.platform,
        url: body.url,
        icon: body.icon,
        active: body.active !== undefined ? Boolean(body.active) : undefined,
      },
    })

    return NextResponse.json({ link })
  } catch (error) {
    console.error('PUT /api/social/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 })
  }
}

// DELETE /api/social/[id] - delete social link (super_admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.socialLink.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Social link not found' }, { status: 404 })

    await db.socialLink.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/social/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 })
  }
}
