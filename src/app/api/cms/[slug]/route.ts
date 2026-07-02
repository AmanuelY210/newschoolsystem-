import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/cms/[slug] - get page by slug (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const page = await db.cMSPage.findUnique({ where: { slug } })

    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    // If unpublished, only super_admin can view
    if (!page.published) {
      const user = await getCurrentUser()
      if (!user || user.role !== 'super_admin') {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('GET /api/cms/[slug] error:', error)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

// PUT /api/cms/[slug] - update page (super_admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { slug } = await params
    const existing = await db.cMSPage.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    const body = await req.json()

    const page = await db.cMSPage.update({
      where: { slug },
      data: {
        title: body.title,
        content: body.content,
        bannerImage: body.bannerImage,
        metaDescription: body.metaDescription,
        published: body.published !== undefined ? Boolean(body.published) : undefined,
        // Allow slug change
        ...(body.slug && body.slug !== slug ? { slug: body.slug } : {}),
      },
    })

    return NextResponse.json({ page })
  } catch (error) {
    console.error('PUT /api/cms/[slug] error:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

// DELETE /api/cms/[slug] - delete page (super_admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { slug } = await params
    const existing = await db.cMSPage.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    await db.cMSPage.delete({ where: { slug } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/cms/[slug] error:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
