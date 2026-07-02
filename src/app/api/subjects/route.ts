import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

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
