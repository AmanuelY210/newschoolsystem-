import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/promotions - list promotions
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const academicYear = searchParams.get('academicYear')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (academicYear) where.academicYear = academicYear

    const promotions = await db.promotion.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            grade: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('GET /api/promotions error:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

// POST /api/promotions - create promotion
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'promotion.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { studentId, fromGrade, toGrade, academicYear, promoted, remarks } = body

    if (!studentId || !fromGrade || !toGrade || !academicYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const promotion = await db.promotion.create({
      data: {
        studentId,
        fromGrade,
        toGrade,
        academicYear,
        promoted: promoted !== undefined ? Boolean(promoted) : true,
        remarks: remarks || null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            grade: true,
          },
        },
      },
    })

    // Optionally update student's grade if promoted
    if (promoted !== false) {
      const newGrade = await db.grade.findFirst({ where: { name: toGrade } })
      if (newGrade) {
        await db.student.update({
          where: { id: studentId },
          data: { gradeId: newGrade.id },
        })
      }
    }

    return NextResponse.json({ promotion }, { status: 201 })
  } catch (error) {
    console.error('POST /api/promotions error:', error)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}
