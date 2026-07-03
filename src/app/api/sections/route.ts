import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/sections - list sections, optionally filtered by gradeId
// Public access for GET (needed by public pages and portal)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gradeId = searchParams.get('gradeId')

    const where: any = {}
    if (gradeId) where.gradeId = gradeId

    const sections = await db.section.findMany({
      where,
      include: {
        grade: { select: { id: true, name: true, level: true } },
        students: { select: { id: true, status: true } },
      },
      orderBy: [{ grade: { level: 'asc' } }, { name: 'asc' }],
    })

    const result = sections.map(s => ({
      id: s.id,
      name: s.name,
      gradeId: s.gradeId,
      grade: s.grade,
      capacity: s.capacity,
      roomNumber: s.roomNumber,
      classTeacherId: s.classTeacherId,
      status: s.status,
      createdAt: s.createdAt,
      studentCount: s.students.length,
      activeStudentCount: s.students.filter(st => st.status === 'active').length,
    }))

    return NextResponse.json({ sections: result })
  } catch (error) {
    console.error('GET /api/sections error:', error)
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

// POST /api/sections - create section
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'section.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, gradeId, capacity, roomNumber, classTeacherId, status } = body

    if (!name || !gradeId) {
      return NextResponse.json({ error: 'Name and grade are required' }, { status: 400 })
    }

    const section = await db.section.create({
      data: {
        name,
        gradeId,
        capacity: capacity ? Number(capacity) : 40,
        roomNumber: roomNumber || null,
        classTeacherId: classTeacherId || null,
        status: status || 'active',
      },
      include: { grade: { select: { id: true, name: true, level: true } } },
    })

    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sections error:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}
