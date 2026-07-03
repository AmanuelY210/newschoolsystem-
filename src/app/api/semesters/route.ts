import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/semesters - list all semesters
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const academicYearId = searchParams.get('academicYearId')

    const where: any = {}
    if (academicYearId) where.academicYearId = academicYearId

    const semesters = await db.semester.findMany({
      where,
      include: { academicYear: true },
      orderBy: [{ academicYear: { startDate: 'desc' } }, { startDate: 'asc' }],
    })

    return NextResponse.json({ semesters })
  } catch (error) {
    console.error('GET /api/semesters error:', error)
    return NextResponse.json({ error: 'Failed to fetch semesters' }, { status: 500 })
  }
}

// POST /api/semesters - create semester
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'academicyear.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { academicYearId, name, startDate, endDate, status } = body

    if (!academicYearId || !name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const semester = await db.semester.create({
      data: {
        academicYearId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'active',
      },
      include: { academicYear: true },
    })

    return NextResponse.json({ semester }, { status: 201 })
  } catch (error) {
    console.error('POST /api/semesters error:', error)
    return NextResponse.json({ error: 'Failed to create semester' }, { status: 500 })
  }
}
