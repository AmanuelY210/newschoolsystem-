import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/ranks - list / compute ranks
// Query: term, academicYear, gradeId
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const term = searchParams.get('term') || 'Term 1'
    const academicYear = searchParams.get('academicYear') || String(new Date().getFullYear())
    const gradeId = searchParams.get('gradeId')

    // First check if there are saved ranks for this term/year
    const savedRanks = await db.rank.findMany({
      where: { term, academicYear },
      orderBy: { rank: 'asc' },
    })

    if (savedRanks.length > 0) {
      // Attach student + grade info (Rank model has no relation)
      const studentIds = savedRanks.map(r => r.studentId)
      const students = await db.student.findMany({
        where: { id: { in: studentIds } },
        include: { grade: true },
      })
      const studentMap = new Map(students.map(s => [s.id, s]))

      let filtered = savedRanks
        .map(r => ({
          ...r,
          student: studentMap.get(r.studentId) || null,
        }))
      if (gradeId) {
        filtered = filtered.filter(r => r.student?.gradeId === gradeId)
      }
      return NextResponse.json({ ranks: filtered, computed: false })
    }

    // Otherwise compute live from marks
    const studentWhere: any = {}
    if (gradeId) studentWhere.gradeId = gradeId

    const students = await db.student.findMany({
      where: studentWhere,
      include: {
        grade: true,
        marks: { where: { term } },
      },
    })

    const computed = students
      .map(s => {
        const totalScore = s.marks.reduce((sum, m) => sum + m.score, 0)
        const subjectCount = s.marks.length
        const average = subjectCount > 0 ? totalScore / subjectCount : 0
        return {
          studentId: s.id,
          student: {
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            studentId: s.studentId,
            grade: s.grade,
          },
          term,
          academicYear,
          totalScore,
          average,
          subjectCount,
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }))

    return NextResponse.json({ ranks: computed, computed: true })
  } catch (error) {
    console.error('GET /api/ranks error:', error)
    return NextResponse.json({ error: 'Failed to fetch ranks' }, { status: 500 })
  }
}

// POST /api/ranks - save a rank record
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'rank.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { studentId, term, academicYear, rank, totalScore, average } = body

    if (!studentId || !term || !academicYear || rank === undefined || totalScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upsert: replace existing rank for this student/term/year
    const existing = await db.rank.findFirst({
      where: { studentId, term, academicYear },
    })

    let rankRecord
    if (existing) {
      rankRecord = await db.rank.update({
        where: { id: existing.id },
        data: {
          rank: Number(rank),
          totalScore: Number(totalScore),
          average: average !== undefined ? Number(average) : 0,
        },
      })
    } else {
      rankRecord = await db.rank.create({
        data: {
          studentId,
          term,
          academicYear,
          rank: Number(rank),
          totalScore: Number(totalScore),
          average: average !== undefined ? Number(average) : 0,
        },
      })
    }

    // Attach student + grade info
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { grade: true },
    })

    return NextResponse.json({ rank: { ...rankRecord, student } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/ranks error:', error)
    return NextResponse.json({ error: 'Failed to save rank' }, { status: 500 })
  }
}
