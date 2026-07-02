import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/submissions - list submissions with filters
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const assignmentId = searchParams.get('assignmentId')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (assignmentId) where.assignmentId = assignmentId
    if (studentId) where.studentId = studentId

    // Students can only view their own submissions
    if (user.role === 'student') {
      const studentProfile = await db.student.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      if (studentProfile) {
        where.studentId = studentProfile.id
      } else {
        return NextResponse.json({ submissions: [] })
      }
    }

    const submissions = await db.assignmentSubmission.findMany({
      where,
      include: {
        assignment: { include: { subject: true } },
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('GET /api/submissions error:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

// POST /api/submissions - create submission
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'assignment.submit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { assignmentId, content, fileUrl, studentId } = body

    if (!assignmentId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If user is a student, use their studentId
    let resolvedStudentId = studentId
    if (user.role === 'student') {
      const studentProfile = await db.student.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      if (!studentProfile) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
      }
      resolvedStudentId = studentProfile.id
    }

    if (!resolvedStudentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const submission = await db.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: resolvedStudentId,
        submittedById: user.id,
        content,
        fileUrl: fileUrl || null,
      },
      include: {
        assignment: { include: { subject: true } },
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
    })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error('POST /api/submissions error:', error)
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }
}
