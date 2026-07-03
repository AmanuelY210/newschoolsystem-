import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/holidays - list holidays
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const year = searchParams.get('year')

    const where: any = {}
    if (type) where.type = type
    if (year) {
      const startOfYear = new Date(`${year}-01-01`)
      const endOfYear = new Date(`${year}-12-31T23:59:59`)
      where.date = { gte: startOfYear, lte: endOfYear }
    }

    const holidays = await db.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ holidays })
  } catch (error) {
    console.error('GET /api/holidays error:', error)
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 })
  }
}

// POST /api/holidays - create holiday
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'academicyear.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, date, type, description } = body

    if (!name || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const holiday = await db.holiday.create({
      data: {
        name,
        date: new Date(date),
        type: type || 'holiday',
        description: description || null,
      },
    })

    return NextResponse.json({ holiday }, { status: 201 })
  } catch (error) {
    console.error('POST /api/holidays error:', error)
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 })
  }
}
