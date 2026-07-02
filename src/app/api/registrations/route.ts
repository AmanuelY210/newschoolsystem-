import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/registrations - list registration applications (admin/super_admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status

    const applications = await db.registrationApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('GET /api/registrations error:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

// POST /api/registrations - create application (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      desiredGrade,
      guardianName,
      guardianPhone,
      guardianEmail,
      address,
      previousSchool,
    } = body

    if (!firstName || !lastName || !guardianName || !guardianPhone) {
      return NextResponse.json(
        { error: 'Missing required fields (firstName, lastName, guardianName, guardianPhone)' },
        { status: 400 }
      )
    }

    // Generate applicationId as APP-2024-XXX
    const count = await db.registrationApplication.count()
    const applicationId = `APP-2024-${String(count + 1).padStart(3, '0')}`

    const application = await db.registrationApplication.create({
      data: {
        applicationId,
        firstName,
        lastName,
        gender: gender || 'male',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        desiredGrade: desiredGrade || null,
        guardianName,
        guardianPhone,
        guardianEmail: guardianEmail || null,
        address: address || null,
        previousSchool: previousSchool || null,
        status: 'pending',
      },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('POST /api/registrations error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
