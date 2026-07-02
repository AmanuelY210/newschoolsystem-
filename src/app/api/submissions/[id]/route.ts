import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// PUT /api/submissions/[id] - grade / update submission
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'assignment.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await db.assignmentSubmission.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

    const submission = await db.assignmentSubmission.update({
      where: { id },
      data: {
        score: body.score !== undefined ? Number(body.score) : undefined,
        feedback: body.feedback,
        status: body.status,
        content: body.content,
        fileUrl: body.fileUrl,
      },
      include: {
        assignment: { include: { subject: true } },
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('PUT submission error:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}
