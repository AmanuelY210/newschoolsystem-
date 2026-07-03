import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/attendance - list attendance with filters
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (teacherId) where.teacherId = teacherId
    if (status) where.status = status
    if (date) {
      const day = new Date(date)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      where.date = { gte: day, lt: next }
    }

    // Teachers can only see attendance they recorded
    if (user.role === 'teacher') {
      const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
      if (teacher) {
        where.teacherId = teacher.id
      }
    }

    // Students can only see their own attendance
    if (user.role === 'student') {
      const student = await db.student.findUnique({ where: { userId: user.id } })
      if (student) {
        where.studentId = student.id
      }
    }

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('GET /api/attendance error:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

// POST /api/attendance - create attendance record
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'attendance.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { studentId, teacherId, date, status, remarks } = body

    if (!studentId || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const attendance = await db.attendance.create({
      data: {
        studentId,
        teacherId: teacherId || null,
        date: new Date(date),
        status,
        remarks: remarks || null,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
    })

    return NextResponse.json({ attendance }, { status: 201 })
  } catch (error) {
    console.error('POST /api/attendance error:', error)
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 })
  }
}
