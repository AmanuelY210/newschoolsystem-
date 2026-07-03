import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/academic-years - list all academic years
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const academicYears = await db.academicYear.findMany({
      include: {
        _count: { select: { semesters: true, curricula: true, exams: true, teacherAssignments: true } },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({ academicYears })
  } catch (error) {
    console.error('GET /api/academic-years error:', error)
    return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 })
  }
}

// POST /api/academic-years - create academic year (admin/super_admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'academicyear.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, startDate, endDate, isCurrent, status } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If marking as current, unset any other current year
    if (isCurrent) {
      await db.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      })
    }

    const academicYear = await db.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: Boolean(isCurrent),
        status: status || 'active',
      },
    })

    return NextResponse.json({ academicYear }, { status: 201 })
  } catch (error) {
    console.error('POST /api/academic-years error:', error)
    return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 })
  }
}
