import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/grades - list all grades with sections, subjects, and student count
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const grades = await db.grade.findMany({
      include: {
        sections: { orderBy: { name: 'asc' } },
        subjects: true,
        students: { select: { id: true, status: true } },
      },
      orderBy: { level: 'asc' },
    })

    const result = grades.map(g => ({
      id: g.id,
      name: g.name,
      code: g.code,
      level: g.level,
      educationLevel: g.educationLevel,
      description: g.description,
      status: g.status,
      createdAt: g.createdAt,
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

// POST /api/grades - create grade (admin/super_admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'class.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, code, level, educationLevel, description, status } = body

    if (!name || level === undefined) {
      return NextResponse.json({ error: 'Name and level are required' }, { status: 400 })
    }

    const grade = await db.grade.create({
      data: {
        name,
        code: code || null,
        level: Number(level),
        educationLevel: educationLevel || 'secondary',
        description: description || null,
        status: status || 'active',
      },
      include: { sections: true },
    })

    return NextResponse.json({ grade }, { status: 201 })
  } catch (error) {
    console.error('POST /api/grades error:', error)
    return NextResponse.json({ error: 'Failed to create grade' }, { status: 500 })
  }
}
