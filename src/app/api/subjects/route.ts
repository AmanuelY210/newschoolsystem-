import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/subjects - list all subjects, optionally filtered by gradeId
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const gradeId = searchParams.get('gradeId')

    const where: any = {}
    if (gradeId) where.gradeId = gradeId

    const subjects = await db.subject.findMany({
      where,
      include: {
        grade: { select: { id: true, name: true, level: true } },
      },
      orderBy: [{ grade: { level: 'asc' } }, { name: 'asc' }],
    })

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error('GET /api/subjects error:', error)
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
  }
}

// POST /api/subjects - create subject
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'subject.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, code, gradeId, creditHours, passingMarks, totalMarks, status } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 })
    }

    const subject = await db.subject.create({
      data: {
        name,
        code,
        gradeId: gradeId || null,
        creditHours: creditHours !== undefined ? Number(creditHours) : 1,
        passingMarks: passingMarks !== undefined ? Number(passingMarks) : 50,
        totalMarks: totalMarks !== undefined ? Number(totalMarks) : 100,
        status: status || 'active',
      },
      include: { grade: { select: { id: true, name: true, level: true } } },
    })

    return NextResponse.json({ subject }, { status: 201 })
  } catch (error) {
    console.error('POST /api/subjects error:', error)
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 })
  }
}
