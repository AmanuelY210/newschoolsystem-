import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/exams - list exams
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const examTypeId = searchParams.get('examTypeId')
    const academicYearId = searchParams.get('academicYearId')
    const gradeId = searchParams.get('gradeId')
    const subjectId = searchParams.get('subjectId')
    const status = searchParams.get('status')

    const where: any = {}
    if (examTypeId) where.examTypeId = examTypeId
    if (academicYearId) where.academicYearId = academicYearId
    if (gradeId) where.gradeId = gradeId
    if (subjectId) where.subjectId = subjectId
    if (status) where.status = status

    const exams = await db.exam.findMany({
      where,
      include: {
        examType: true,
        academicYear: true,
        grade: true,
        subject: true,
      },
      orderBy: { examDate: 'desc' },
    })

    return NextResponse.json({ exams })
  } catch (error) {
    console.error('GET /api/exams error:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}

// POST /api/exams - create exam
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'exam.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      examTypeId, academicYearId, name, gradeId, subjectId,
      examDate, totalMarks, passingMarks, status,
    } = body

    if (!examTypeId || !name || !examDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exam = await db.exam.create({
      data: {
        examTypeId,
        academicYearId: academicYearId || null,
        name,
        gradeId: gradeId || null,
        subjectId: subjectId || null,
        examDate: new Date(examDate),
        totalMarks: totalMarks !== undefined ? Number(totalMarks) : 100,
        passingMarks: passingMarks !== undefined ? Number(passingMarks) : 50,
        status: status || 'scheduled',
      },
      include: {
        examType: true,
        academicYear: true,
        grade: true,
        subject: true,
      },
    })

    return NextResponse.json({ exam }, { status: 201 })
  } catch (error) {
    console.error('POST /api/exams error:', error)
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
}
