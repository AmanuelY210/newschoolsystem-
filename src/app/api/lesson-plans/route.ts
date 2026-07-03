import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/lesson-plans - list lesson plans
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId')
    const teacherId = searchParams.get('teacherId')

    const where: any = {}
    if (subjectId) where.subjectId = subjectId
    if (teacherId) where.teacherId = teacherId

    // Teachers only see their own lesson plans
    if (user.role === 'teacher') {
      const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
      if (teacher) where.teacherId = teacher.id
    }

    const lessonPlans = await db.lessonPlan.findMany({
      where,
      include: {
        subject: { include: { grade: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ lessonPlans })
  } catch (error) {
    console.error('GET /api/lesson-plans error:', error)
    return NextResponse.json({ error: 'Failed to fetch lesson plans' }, { status: 500 })
  }
}

// POST /api/lesson-plans - create lesson plan
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'subject.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { subjectId, teacherId, title, description, content, date, duration, fileUrl } = body

    if (!subjectId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If logged-in teacher doesn't supply teacherId, use their own
    let resolvedTeacherId = teacherId
    if (!resolvedTeacherId && user.role === 'teacher') {
      const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
      resolvedTeacherId = teacher?.id || null
    }

    const lessonPlan = await db.lessonPlan.create({
      data: {
        subjectId,
        teacherId: resolvedTeacherId || null,
        title,
        description: description || null,
        content: content || null,
        date: date ? new Date(date) : null,
        duration: duration ? Number(duration) : null,
        fileUrl: fileUrl || null,
      },
      include: {
        subject: { include: { grade: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ lessonPlan }, { status: 201 })
  } catch (error) {
    console.error('POST /api/lesson-plans error:', error)
    return NextResponse.json({ error: 'Failed to create lesson plan' }, { status: 500 })
  }
}
