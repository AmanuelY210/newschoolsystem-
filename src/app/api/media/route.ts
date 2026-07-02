import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/media - list media items (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    const where: any = { published: true }
    if (type) where.type = type
    if (category) where.category = category

    const media = await db.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('GET /api/media error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

// POST /api/media - create media item (super_admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, type, url, thumbnailUrl, category } = body

    if (!title || !type || !url) {
      return NextResponse.json({ error: 'Missing required fields (title, type, url)' }, { status: 400 })
    }

    const media = await db.mediaItem.create({
      data: {
        title,
        description: description || null,
        type,
        url,
        thumbnailUrl: thumbnailUrl || null,
        category: category || 'general',
        published: body.published !== undefined ? Boolean(body.published) : true,
      },
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    console.error('POST /api/media error:', error)
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 })
  }
}
