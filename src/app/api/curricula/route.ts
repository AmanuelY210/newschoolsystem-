import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/curricula - list curricula
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const academicYearId = searchParams.get('academicYearId')
    const subjectId = searchParams.get('subjectId')

    const where: any = {}
    if (academicYearId) where.academicYearId = academicYearId
    if (subjectId) where.subjectId = subjectId

    const curricula = await db.curriculum.findMany({
      where,
      include: {
        subject: { include: { grade: true } },
        academicYear: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ curricula })
  } catch (error) {
    console.error('GET /api/curricula error:', error)
    return NextResponse.json({ error: 'Failed to fetch curricula' }, { status: 500 })
  }
}

// POST /api/curricula - create curriculum
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'subject.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { academicYearId, subjectId, title, description, topics, objectives } = body

    if (!subjectId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const curriculum = await db.curriculum.create({
      data: {
        academicYearId: academicYearId || null,
        subjectId,
        title,
        description: description || null,
        topics: topics || null,
        objectives: objectives || null,
      },
      include: {
        subject: { include: { grade: true } },
        academicYear: true,
      },
    })

    return NextResponse.json({ curriculum }, { status: 201 })
  } catch (error) {
    console.error('POST /api/curricula error:', error)
    return NextResponse.json({ error: 'Failed to create curriculum' }, { status: 500 })
  }
}
