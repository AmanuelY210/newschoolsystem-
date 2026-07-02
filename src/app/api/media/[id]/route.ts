import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/media/[id] - update media (super_admin only)
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
    const existing = await db.mediaItem.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Media item not found' }, { status: 404 })

    const body = await req.json()
    const media = await db.mediaItem.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl,
        category: body.category,
        published: body.published !== undefined ? Boolean(body.published) : undefined,
      },
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('PUT /api/media/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}

// DELETE /api/media/[id] - delete media (super_admin only)
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
    const existing = await db.mediaItem.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Media item not found' }, { status: 404 })

    await db.mediaItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/media/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}
