import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/teacher-assignments - list teacher assignments
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get('teacherId')
    const gradeId = searchParams.get('gradeId')
    const sectionId = searchParams.get('sectionId')
    const subjectId = searchParams.get('subjectId')
    const academicYearId = searchParams.get('academicYearId')
    const status = searchParams.get('status')

    const where: any = {}
    if (teacherId) where.teacherId = teacherId
    if (gradeId) where.gradeId = gradeId
    if (sectionId) where.sectionId = sectionId
    if (subjectId) where.subjectId = subjectId
    if (academicYearId) where.academicYearId = academicYearId
    if (status) where.status = status

    // Teachers only see their own assignments
    if (user.role === 'teacher') {
      const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
      if (teacher) where.teacherId = teacher.id
    }

    const teacherAssignments = await db.teacherAssignment.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            teacherId: true,
            user: { select: { email: true } },
          },
        },
        grade: { select: { id: true, name: true, level: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ teacherAssignments })
  } catch (error) {
    console.error('GET /api/teacher-assignments error:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher assignments' }, { status: 500 })
  }
}

// POST /api/teacher-assignments - create teacher assignment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'teacher.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      teacherId, gradeId, sectionId, subjectId, academicYearId,
      campus, weeklyPeriods, room, status,
    } = body

    if (!teacherId || !gradeId || !subjectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const assignment = await db.teacherAssignment.create({
      data: {
        teacherId,
        gradeId,
        sectionId: sectionId || null,
        subjectId,
        academicYearId: academicYearId || null,
        campus: campus || null,
        weeklyPeriods: weeklyPeriods !== undefined ? Number(weeklyPeriods) : 0,
        room: room || null,
        status: status || 'active',
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            teacherId: true,
            user: { select: { email: true } },
          },
        },
        grade: { select: { id: true, name: true, level: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ teacherAssignment: assignment }, { status: 201 })
  } catch (error) {
    console.error('POST /api/teacher-assignments error:', error)
    return NextResponse.json({ error: 'Failed to create teacher assignment' }, { status: 500 })
  }
}
