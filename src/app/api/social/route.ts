import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/social - list all active social links (public)
export async function GET() {
  try {
    const links = await db.socialLink.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ links })
  } catch (error) {
    console.error('GET /api/social error:', error)
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 })
  }
}

// POST /api/social - create social link (super_admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { platform, url, icon, active } = body

    if (!platform || !url) {
      return NextResponse.json({ error: 'Missing required fields (platform, url)' }, { status: 400 })
    }

    const existing = await db.socialLink.findUnique({ where: { platform } })
    if (existing) {
      return NextResponse.json({ error: 'Platform already exists. Use PUT to update.' }, { status: 400 })
    }

    const link = await db.socialLink.create({
      data: {
        platform,
        url,
        icon: icon || null,
        active: active !== undefined ? Boolean(active) : true,
      },
    })

    return NextResponse.json({ link }, { status: 201 })
  } catch (error) {
    console.error('POST /api/social error:', error)
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 })
  }
}
