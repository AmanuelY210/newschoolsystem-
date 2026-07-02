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
    const search = searchParams.get('search')

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { trackingNumber: { contains: search } },
        { applicationId: { contains: search } },
        { admissionNumber: { contains: search } },
        { guardianName: { contains: search } },
        { guardianPhone: { contains: search } },
      ]
    }

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

function generateTrackingNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TRK-${year}-${random}`
}

// POST /api/registrations - create application (public, no auth required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Step 1: Student Information (required fields)
    const {
      firstName,
      lastName,
      grandFatherName,
      gender,
      program,
      field,
      mediaOfInstruction,
      dateOfBirth,
      age,
      nationalId,
      studentPhoto,
      // Step 2: Academic Background
      applyForGrade,
      lastGradeCompleted,
      gradeAverage,
      lastSchoolAttended,
      registrationCondition,
      // Step 3: Guardian Information
      guardianName,
      guardianRelationship,
      guardianPhone,
      guardianEmail,
      guardianAddress,
      // Step 4: Documents
      certificateFrontUrl,
      certificateBackUrl,
      studentIdFrontUrl,
      parentPhotoUrl,
      parentIdUrl,
      clearanceUrl,
      // Step 5: Payment
      paymentMethod,
      paymentReceiptUrl,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !guardianName || !guardianPhone) {
      return NextResponse.json(
        { error: 'Missing required fields (firstName, lastName, guardianName, guardianPhone)' },
        { status: 400 }
      )
    }

    // Generate unique applicationId and trackingNumber
    const count = await db.registrationApplication.count()
    const year = new Date().getFullYear()
    const applicationId = `APP-${year}-${String(count + 1).padStart(3, '0')}`
    let trackingNumber = generateTrackingNumber()

    // Ensure tracking number is unique
    let existing = await db.registrationApplication.findUnique({ where: { trackingNumber } })
    while (existing) {
      trackingNumber = generateTrackingNumber()
      existing = await db.registrationApplication.findUnique({ where: { trackingNumber } })
    }

    const application = await db.registrationApplication.create({
      data: {
        applicationId,
        trackingNumber,
        firstName,
        lastName,
        grandFatherName: grandFatherName || null,
        gender: gender || 'male',
        program: program || null,
        field: field || null,
        mediaOfInstruction: mediaOfInstruction || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        age: age ? parseInt(String(age)) : null,
        nationalId: nationalId || null,
        studentPhoto: studentPhoto || null,
        applyForGrade: applyForGrade || null,
        lastGradeCompleted: lastGradeCompleted || null,
        gradeAverage: gradeAverage || null,
        lastSchoolAttended: lastSchoolAttended || null,
        registrationCondition: registrationCondition || null,
        guardianName,
        guardianRelationship: guardianRelationship || null,
        guardianPhone,
        guardianEmail: guardianEmail || null,
        guardianAddress: guardianAddress || null,
        certificateFrontUrl: certificateFrontUrl || null,
        certificateBackUrl: certificateBackUrl || null,
        studentIdFrontUrl: studentIdFrontUrl || null,
        parentPhotoUrl: parentPhotoUrl || null,
        parentIdUrl: parentIdUrl || null,
        clearanceUrl: clearanceUrl || null,
        paymentMethod: paymentMethod || null,
        paymentReceiptUrl: paymentReceiptUrl || null,
        status: 'submitted',
      },
    })

    return NextResponse.json({
      application,
      trackingNumber,
      message: 'Application submitted successfully. Save your tracking number to check your status.',
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/registrations error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
