import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/reports - generate report card data
// Query: studentId, term, academicYear
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'report.view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const term = searchParams.get('term') || 'Term 1'
    const academicYear = searchParams.get('academicYear') || String(new Date().getFullYear())

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    // If the user is a student, ensure they can only see their own report
    let effectiveStudentId = studentId
    if (user.role === 'student') {
      const ownStudent = await db.student.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      if (!ownStudent || ownStudent.id !== studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      effectiveStudentId = ownStudent.id
    }

    const student = await db.student.findUnique({
      where: { id: effectiveStudentId },
      include: {
        grade: true,
        section: true,
        user: { select: { email: true, phone: true, avatar: true } },
        marks: {
          where: { term },
          include: { subject: true, teacher: { select: { id: true, firstName: true, lastName: true } } },
        },
        promotions: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    // Compute summary
    const totalScore = student.marks.reduce((sum, m) => sum + m.score, 0)
    const maxTotal = student.marks.reduce((sum, m) => sum + m.totalScore, 0)
    const average = student.marks.length > 0 ? totalScore / student.marks.length : 0

    // Find rank
    const rankRecord = await db.rank.findFirst({
      where: { studentId: effectiveStudentId, term, academicYear },
    })

    // Attendance summary (all attendance records for this student)
    const allAttendance = await db.attendance.findMany({
      where: { studentId: effectiveStudentId },
    })
    const attendanceSummary = {
      total: allAttendance.length,
      present: allAttendance.filter(a => a.status === 'present').length,
      absent: allAttendance.filter(a => a.status === 'absent').length,
      late: allAttendance.filter(a => a.status === 'late').length,
      excused: allAttendance.filter(a => a.status === 'excused').length,
    }

    // Compute class rank by comparing against classmates
    let classRank: number | null = null
    let classSize = 0
    if (student.gradeId) {
      const classmates = await db.student.findMany({
        where: { gradeId: student.gradeId },
        include: {
          marks: { where: { term } },
        },
      })
      classSize = classmates.length
      const sorted = classmates
        .map(s => ({
          id: s.id,
          total: s.marks.reduce((sum, m) => sum + m.score, 0),
        }))
        .sort((a, b) => b.total - a.total)
      const idx = sorted.findIndex(s => s.id === effectiveStudentId)
      classRank = idx >= 0 ? idx + 1 : null
    }

    return NextResponse.json({
      report: {
        student,
        term,
        academicYear,
        marks: student.marks,
        summary: {
          totalScore,
          maxTotal,
          average,
          subjectCount: student.marks.length,
        },
        rank: rankRecord?.rank ?? classRank,
        classSize,
        attendanceSummary,
        savedRank: rankRecord,
      },
    })
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
