import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// Helper: compute grade letter from percentage
export function computeGrade(score: number, totalScore: number): string {
  const pct = totalScore > 0 ? (score / totalScore) * 100 : 0
  if (pct >= 90) return 'A+'
  if (pct >= 85) return 'A'
  if (pct >= 80) return 'B+'
  if (pct >= 75) return 'B'
  if (pct >= 65) return 'C+'
  if (pct >= 50) return 'C'
  return 'F'
}

// GET /api/marks - list marks with filters
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    const subjectId = searchParams.get('subjectId')
    const term = searchParams.get('term')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (teacherId) where.teacherId = teacherId
    if (subjectId) where.subjectId = subjectId
    if (term) where.term = term

    const marks = await db.mark.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ marks })
  } catch (error) {
    console.error('GET /api/marks error:', error)
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 })
  }
}

// POST /api/marks - create mark
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'mark.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      studentId, teacherId, subjectId, term, assessmentType,
      score, totalScore, remarks,
    } = body

    if (!studentId || !subjectId || score === undefined || totalScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const numericScore = Number(score)
    const numericTotal = Number(totalScore)
    const grade = computeGrade(numericScore, numericTotal)

    const mark = await db.mark.create({
      data: {
        studentId,
        teacherId: teacherId || null,
        subjectId,
        term: term || 'Term 1',
        assessmentType: assessmentType || 'exam',
        score: numericScore,
        totalScore: numericTotal,
        grade,
        remarks: remarks || null,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ mark }, { status: 201 })
  } catch (error) {
    console.error('POST /api/marks error:', error)
    return NextResponse.json({ error: 'Failed to create mark' }, { status: 500 })
  }
}
