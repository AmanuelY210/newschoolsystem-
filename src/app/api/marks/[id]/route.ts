import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { computeGrade } from '../route'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const mark = await db.mark.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (!mark) return NextResponse.json({ error: 'Mark not found' }, { status: 404 })

    return NextResponse.json({ mark })
  } catch (error) {
    console.error('GET mark error:', error)
    return NextResponse.json({ error: 'Failed to fetch mark' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'mark.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    // If score/total changes, recompute grade
    let grade: string | undefined
    if (body.score !== undefined || body.totalScore !== undefined) {
      const existing = await db.mark.findUnique({ where: { id }, select: { score: true, totalScore: true } })
      if (!existing) return NextResponse.json({ error: 'Mark not found' }, { status: 404 })
      const score = body.score !== undefined ? Number(body.score) : existing.score
      const totalScore = body.totalScore !== undefined ? Number(body.totalScore) : existing.totalScore
      grade = computeGrade(score, totalScore)
    }

    const mark = await db.mark.update({
      where: { id },
      data: {
        studentId: body.studentId,
        teacherId: body.teacherId,
        subjectId: body.subjectId,
        term: body.term,
        assessmentType: body.assessmentType,
        score: body.score !== undefined ? Number(body.score) : undefined,
        totalScore: body.totalScore !== undefined ? Number(body.totalScore) : undefined,
        grade,
        remarks: body.remarks,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ mark })
  } catch (error) {
    console.error('PUT mark error:', error)
    return NextResponse.json({ error: 'Failed to update mark' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'mark.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const mark = await db.mark.findUnique({ where: { id } })
    if (!mark) return NextResponse.json({ error: 'Mark not found' }, { status: 404 })

    await db.mark.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE mark error:', error)
    return NextResponse.json({ error: 'Failed to delete mark' }, { status: 500 })
  }
}
