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
    const semester = await db.semester.findUnique({
      where: { id },
      include: { academicYear: true },
    })

    if (!semester) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ semester })
  } catch (error) {
    console.error('GET semester error:', error)
    return NextResponse.json({ error: 'Failed to fetch semester' }, { status: 500 })
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
    const { academicYearId, name, startDate, endDate, status } = body

    const semester = await db.semester.update({
      where: { id },
      data: {
        ...(academicYearId !== undefined && { academicYearId }),
        ...(name !== undefined && { name }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(status !== undefined && { status }),
      },
      include: { academicYear: true },
    })

    return NextResponse.json({ semester })
  } catch (error) {
    console.error('PUT semester error:', error)
    return NextResponse.json({ error: 'Failed to update semester' }, { status: 500 })
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
    await db.semester.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE semester error:', error)
    return NextResponse.json({ error: 'Failed to delete semester' }, { status: 500 })
  }
}
