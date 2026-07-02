import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/events - list upcoming events (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming') !== 'false' // default: true

    const where: any = {}
    if (type) where.type = type
    if (upcoming) {
      const now = new Date()
      where.date = { gte: now }
    }

    const events = await db.event.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/events - create event (super_admin or admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, date, location, type } = body

    if (!title || !date) {
      return NextResponse.json({ error: 'Missing required fields (title, date)' }, { status: 400 })
    }

    const event = await db.event.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        location: location || null,
        type: type || 'event',
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('POST /api/events error:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
