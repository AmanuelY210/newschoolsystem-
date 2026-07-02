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
    const student = await db.student.findUnique({
      where: { id },
      include: {
        grade: true,
        section: true,
        user: { select: { email: true, phone: true, avatar: true } },
        marks: { include: { subject: true, teacher: true } },
        attendance: { orderBy: { date: 'desc' }, take: 30 },
        transactions: { orderBy: { date: 'desc' } },
        libraryLoans: { include: { book: true } },
      },
    })

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    return NextResponse.json({ student })
  } catch (error) {
    console.error('GET student error:', error)
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'student.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const student = await db.student.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        bloodGroup: body.bloodGroup,
        nationalId: body.nationalId,
        gradeId: body.gradeId,
        sectionId: body.sectionId,
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        guardianEmail: body.guardianEmail,
        address: body.address,
        photoUrl: body.photoUrl,
        status: body.status,
      },
      include: { grade: true, section: true },
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error('PUT student error:', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'student.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const student = await db.student.findUnique({ where: { id } })
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    await db.student.delete({ where: { id } })
    await db.user.delete({ where: { id: student.userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE student error:', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
