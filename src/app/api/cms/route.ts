import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/cms - list all CMS pages (public for published, auth optional)
export async function GET() {
  try {
    const user = await getCurrentUser()

    const where: any = user?.role === 'super_admin' ? {} : { published: true }

    const pages = await db.cMSPage.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('GET /api/cms error:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

// POST /api/cms - create or update CMS page (super_admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { slug, title, content, bannerImage, metaDescription, published } = body

    if (!slug || !title || content === undefined) {
      return NextResponse.json({ error: 'Missing required fields (slug, title, content)' }, { status: 400 })
    }

    // Upsert by slug
    const page = await db.cMSPage.upsert({
      where: { slug },
      create: {
        slug,
        title,
        content,
        bannerImage: bannerImage || null,
        metaDescription: metaDescription || null,
        published: published !== undefined ? Boolean(published) : true,
      },
      update: {
        title,
        content,
        bannerImage: bannerImage !== undefined ? bannerImage : undefined,
        metaDescription: metaDescription !== undefined ? metaDescription : undefined,
        published: published !== undefined ? Boolean(published) : undefined,
      },
    })

    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    console.error('POST /api/cms error:', error)
    return NextResponse.json({ error: 'Failed to save page' }, { status: 500 })
  }
}
