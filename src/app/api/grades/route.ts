import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/grades - list all grades with sections and student count
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const grades = await db.grade.findMany({
      include: {
        sections: true,
        subjects: true,
        students: { select: { id: true, status: true } },
      },
      orderBy: { level: 'asc' },
    })

    const result = grades.map(g => ({
      id: g.id,
      name: g.name,
      level: g.level,
      sections: g.sections,
      subjectCount: g.subjects.length,
      studentCount: g.students.length,
      activeStudentCount: g.students.filter(s => s.status === 'active').length,
    }))

    return NextResponse.json({ grades: result })
  } catch (error) {
    console.error('GET /api/grades error:', error)
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 })
  }
}
