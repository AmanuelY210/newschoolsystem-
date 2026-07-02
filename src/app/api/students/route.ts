import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/students - list all students
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const gradeId = searchParams.get('gradeId')
    const sectionId = searchParams.get('sectionId')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {}
    if (gradeId) where.gradeId = gradeId
    if (sectionId) where.sectionId = sectionId
    if (status) where.status = status
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { studentId: { contains: search } },
      ]
    }

    const students = await db.student.findMany({
      where,
      include: {
        grade: true,
        section: true,
        user: { select: { email: true, phone: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('GET /api/students error:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

// POST /api/students - create student
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'student.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      email, password, firstName, lastName, gender, dateOfBirth, bloodGroup,
      nationalId, gradeId, sectionId, guardianName, guardianPhone, guardianEmail,
      address, photoUrl,
    } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email exists
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate student ID
    const count = await db.student.count()
    const studentId = `STU-2024-${String(count + 1).padStart(3, '0')}`

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: passwordHash,
        name: `${firstName} ${lastName}`,
        role: 'student',
        phone: guardianPhone,
        avatar: photoUrl || null,
      },
    })

    const student = await db.student.create({
      data: {
        userId: newUser.id,
        studentId,
        firstName,
        lastName,
        gender: gender || 'male',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        bloodGroup: bloodGroup || null,
        nationalId: nationalId || null,
        gradeId: gradeId || null,
        sectionId: sectionId || null,
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null,
        guardianEmail: guardianEmail || null,
        address: address || null,
        photoUrl: photoUrl || null,
      },
      include: { grade: true, section: true, user: { select: { email: true, phone: true } } },
    })

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('POST /api/students error:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
