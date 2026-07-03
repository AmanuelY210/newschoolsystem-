import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/grading-systems - list grading systems
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const gradingSystems = await db.gradingSystem.findMany({
      orderBy: [{ minPercentage: 'desc' }],
    })

    return NextResponse.json({ gradingSystems })
  } catch (error) {
    console.error('GET /api/grading-systems error:', error)
    return NextResponse.json({ error: 'Failed to fetch grading systems' }, { status: 500 })
  }
}

// POST /api/grading-systems - create grading system
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'grade.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, minPercentage, maxPercentage, grade, gradePoint, description } = body

    if (!name || minPercentage === undefined || maxPercentage === undefined || !grade) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const gradingSystem = await db.gradingSystem.create({
      data: {
        name,
        minPercentage: Number(minPercentage),
        maxPercentage: Number(maxPercentage),
        grade,
        gradePoint: gradePoint !== undefined ? Number(gradePoint) : 0,
        description: description || null,
      },
    })

    return NextResponse.json({ gradingSystem }, { status: 201 })
  } catch (error) {
    console.error('POST /api/grading-systems error:', error)
    return NextResponse.json({ error: 'Failed to create grading system' }, { status: 500 })
  }
}
