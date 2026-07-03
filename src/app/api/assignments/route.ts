import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/assignments - list assignments with filters
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get('teacherId')
    const subjectId = searchParams.get('subjectId')
    const status = searchParams.get('status')

    const where: any = {}
    if (teacherId) where.teacherId = teacherId
    if (subjectId) where.subjectId = subjectId
    if (status) where.status = status

    // Teachers can only see their own assignments
    if (user.role === 'teacher') {
      const teacher = await db.teacher.findUnique({
        where: { userId: user.id },
        include: { teacherAssignments: true },
      })
      if (teacher) {
        where.teacherId = teacher.id
        const assignedSubjectIds = teacher.teacherAssignments.map((a: any) => a.subjectId)
        if (assignedSubjectIds.length > 0) {
          where.subjectId = { in: assignedSubjectIds }
        }
      }
    }

    // Students can only see assignments for their grade's subjects
    if (user.role === 'student') {
      const student = await db.student.findUnique({ where: { userId: user.id } })
      if (student?.gradeId) {
        where.subject = { gradeId: student.gradeId }
      }
    }

    const assignments = await db.assignment.findMany({
      where,
      include: {
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
        submissions: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('GET /api/assignments error:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

// POST /api/assignments - create assignment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'assignment.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, subjectId, teacherId, dueDate, maxScore } = body

    if (!title || !subjectId || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If teacherId not provided and current user is a teacher, use their teacher profile
    let resolvedTeacherId = teacherId
    if (!resolvedTeacherId && user.role === 'teacher') {
      const teacherProfile = await db.teacher.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      if (teacherProfile) resolvedTeacherId = teacherProfile.id
    }

    if (!resolvedTeacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    const assignment = await db.assignment.create({
      data: {
        title,
        description: description || '',
        subjectId,
        teacherId: resolvedTeacherId,
        dueDate: new Date(dueDate),
        maxScore: maxScore ? Number(maxScore) : 100,
        status: body.status || 'active',
      },
      include: {
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('POST /api/assignments error:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}
