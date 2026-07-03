import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/exam-types - list exam types
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const examTypes = await db.examType.findMany({
      include: { _count: { select: { exams: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ examTypes })
  } catch (error) {
    console.error('GET /api/exam-types error:', error)
    return NextResponse.json({ error: 'Failed to fetch exam types' }, { status: 500 })
  }
}

// POST /api/exam-types - create exam type
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'exam.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, totalMarks, weight } = body

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const examType = await db.examType.create({
      data: {
        name,
        description: description || null,
        totalMarks: totalMarks !== undefined ? Number(totalMarks) : 100,
        weight: weight !== undefined ? Number(weight) : 100,
      },
    })

    return NextResponse.json({ examType }, { status: 201 })
  } catch (error) {
    console.error('POST /api/exam-types error:', error)
    return NextResponse.json({ error: 'Failed to create exam type' }, { status: 500 })
  }
}
