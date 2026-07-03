import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'exam.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      examTypeId, academicYearId, name, gradeId, subjectId,
      examDate, totalMarks, passingMarks, status,
    } = body

    const exam = await db.exam.update({
      where: { id },
      data: {
        ...(examTypeId !== undefined && { examTypeId }),
        ...(academicYearId !== undefined && { academicYearId: academicYearId || null }),
        ...(name !== undefined && { name }),
        ...(gradeId !== undefined && { gradeId: gradeId || null }),
        ...(subjectId !== undefined && { subjectId: subjectId || null }),
        ...(examDate !== undefined && { examDate: new Date(examDate) }),
        ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
        ...(passingMarks !== undefined && { passingMarks: Number(passingMarks) }),
        ...(status !== undefined && { status }),
      },
      include: {
        examType: true,
        academicYear: true,
        grade: true,
        subject: true,
      },
    })

    return NextResponse.json({ exam })
  } catch (error) {
    console.error('PUT exam error:', error)
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'exam.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.exam.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE exam error:', error)
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
  }
}
