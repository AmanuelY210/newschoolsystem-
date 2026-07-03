import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/timetables - list timetables
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const gradeId = searchParams.get('gradeId')
    const sectionId = searchParams.get('sectionId')
    const teacherId = searchParams.get('teacherId')
    const academicYear = searchParams.get('academicYear')

    const where: any = {}
    if (gradeId) where.gradeId = gradeId
    if (sectionId) where.sectionId = sectionId
    if (teacherId) where.teacherId = teacherId
    if (academicYear) where.academicYear = academicYear

    const timetables = await db.timetable.findMany({
      where,
      include: {
        grade: true,
        section: true,
        subject: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ timetables })
  } catch (error) {
    console.error('GET /api/timetables error:', error)
    return NextResponse.json({ error: 'Failed to fetch timetables' }, { status: 500 })
  }
}

// POST /api/timetables - create timetable entry
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'timetable.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      gradeId, sectionId, subjectId, teacherId, dayOfWeek,
      startTime, endTime, room, academicYear,
    } = body

    if (!gradeId || !subjectId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const timetable = await db.timetable.create({
      data: {
        gradeId,
        sectionId: sectionId || null,
        subjectId,
        teacherId: teacherId || null,
        dayOfWeek,
        startTime,
        endTime,
        room: room || null,
        academicYear: academicYear || null,
      },
      include: {
        grade: true,
        section: true,
        subject: true,
      },
    })

    return NextResponse.json({ timetable }, { status: 201 })
  } catch (error) {
    console.error('POST /api/timetables error:', error)
    return NextResponse.json({ error: 'Failed to create timetable' }, { status: 500 })
  }
}
