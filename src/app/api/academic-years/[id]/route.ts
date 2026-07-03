import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const academicYear = await db.academicYear.findUnique({
      where: { id },
      include: {
        semesters: { orderBy: { startDate: 'asc' } },
        curricula: { include: { subject: true } },
        exams: { include: { examType: true, grade: true, subject: true } },
      },
    })

    if (!academicYear) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ academicYear })
  } catch (error) {
    console.error('GET academic-year error:', error)
    return NextResponse.json({ error: 'Failed to fetch academic year' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'academicyear.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, startDate, endDate, isCurrent, status } = body

    // If marking as current, unset any other current year
    if (isCurrent) {
      await db.academicYear.updateMany({
        where: { isCurrent: true, NOT: { id } },
        data: { isCurrent: false },
      })
    }

    const academicYear = await db.academicYear.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(isCurrent !== undefined && { isCurrent: Boolean(isCurrent) }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ academicYear })
  } catch (error) {
    console.error('PUT academic-year error:', error)
    return NextResponse.json({ error: 'Failed to update academic year' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'academicyear.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.academicYear.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE academic-year error:', error)
    return NextResponse.json({ error: 'Failed to delete academic year' }, { status: 500 })
  }
}
