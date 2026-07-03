import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET /api/teachers - list all teachers with their user info and assignments
// Public access allowed (for public Teachers page), but sensitive fields filtered
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { teacherId: { contains: search } },
        { specialization: { contains: search } },
      ]
    }

    // If teacher is logged in, only return their own record with assignments
    if (user?.role === 'teacher') {
      const teacher = await db.teacher.findUnique({
        where: { userId: user.id },
        include: {
          user: { select: { email: true, phone: true, avatar: true } },
          teacherAssignments: {
            include: {
              grade: true,
              section: true,
              subject: true,
            },
          },
        },
      })
      return NextResponse.json({ teachers: teacher ? [teacher] : [] })
    }

    const teachers = await db.teacher.findMany({
      where,
      include: {
        user: { select: { email: true, phone: true, avatar: true, active: true } },
        teacherAssignments: {
          include: {
            grade: true,
            section: true,
            subject: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ teachers })
  } catch (error) {
    console.error('GET /api/teachers error:', error)
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

// POST /api/teachers - create teacher (admin/super_admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'teacher.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      email, password, firstName, lastName, gender, qualification,
      specialization, experience, phone, address, salary, photoUrl,
      academicYear, campus,
    } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email exists
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Generate teacher ID
    const count = await db.teacher.count()
    const year = new Date().getFullYear()
    const teacherId = `TCH-${year}-${String(count + 1).padStart(3, '0')}`

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: passwordHash,
        name: `${firstName} ${lastName}`,
        role: 'teacher',
        phone: phone || null,
        avatar: photoUrl || null,
      },
    })

    const teacher = await db.teacher.create({
      data: {
        userId: newUser.id,
        teacherId,
        firstName,
        lastName,
        gender: gender || 'male',
        qualification: qualification || null,
        specialization: specialization || null,
        experience: experience ? Number(experience) : 0,
        phone: phone || null,
        address: address || null,
        salary: salary ? Number(salary) : 0,
        photoUrl: photoUrl || null,
        academicYear: academicYear || null,
        campus: campus || null,
      },
      include: {
        user: { select: { email: true, phone: true, avatar: true } },
        teacherAssignments: { include: { grade: true, section: true, subject: true } },
      },
    })

    return NextResponse.json({ teacher }, { status: 201 })
  } catch (error) {
    console.error('POST /api/teachers error:', error)
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 })
  }
}
