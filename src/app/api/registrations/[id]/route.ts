import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// PUT /api/registrations/[id] - update application status / payment / enroll
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.registrationApplication.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    const body = await req.json()
    const {
      status,
      remarks,
      // Payment setup (admin only)
      payCode,
      paymentAmount,
      paymentMethod,
      // Enrollment
      enroll,
    } = body

    // Validate status
    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'enrolled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Handle ENROLLMENT - convert application to a Student
    if (enroll || status === 'enrolled') {
      // Check if already enrolled
      if (existing.admissionNumber) {
        return NextResponse.json(
          { error: 'Application already enrolled', admissionNumber: existing.admissionNumber },
          { status: 400 }
        )
      }

      // Get custom admission settings
      const settings = await db.siteSetting.findMany({
        where: {
          key: {
            in: [
              'admission_prefix', 'admission_year', 'admission_padding', 'admission_start_number',
              'student_id_prefix', 'student_id_padding', 'admission_default_password',
            ]
          }
        }
      })
      const cfgMap: Record<string, string> = {}
      for (const s of settings) cfgMap[s.key] = s.value
      const admPrefix = cfgMap.admission_prefix || 'ADM'
      const admYear = cfgMap.admission_year || String(new Date().getFullYear())
      const admPadding = parseInt(cfgMap.admission_padding || '3')
      const admStart = parseInt(cfgMap.admission_start_number || '1')
      const stuPrefix = cfgMap.student_id_prefix || 'STU'
      const stuPadding = parseInt(cfgMap.student_id_padding || '3')
      const defaultPwd = cfgMap.admission_default_password || 'password123'

      // Generate admission number and student ID using custom settings
      const enrollCount = await db.student.count()
      const num = admStart + enrollCount
      const admissionNumber = `${admPrefix}-${admYear}-${String(num).padStart(admPadding, '0')}`

      // Find or create grade based on applyForGrade
      let gradeId: string | null = null
      if (existing.applyForGrade) {
        const gradeLevel = parseInt(existing.applyForGrade.replace(/\D/g, ''))
        if (!isNaN(gradeLevel)) {
          const grade = await db.grade.findFirst({ where: { level: gradeLevel } })
          if (grade) gradeId = grade.id
        }
      }

      // Create user account for the student
      const defaultEmail = `${existing.firstName.toLowerCase()}.${existing.lastName.toLowerCase()}${enrollCount + 1}@school.edu`
      const passwordHash = await bcrypt.hash(defaultPwd, 10)

      const newUser = await db.user.create({
        data: {
          email: defaultEmail,
          password: passwordHash,
          name: `${existing.firstName} ${existing.lastName}`,
          role: 'student',
          phone: existing.guardianPhone,
          avatar: existing.studentPhoto || null,
        },
      })

      // Generate student ID using custom settings
      const studentId = `${stuPrefix}-${admYear}-${String(num).padStart(stuPadding, '0')}`

      // Create student record
      const student = await db.student.create({
        data: {
          userId: newUser.id,
          studentId,
          firstName: existing.firstName,
          lastName: existing.lastName,
          gender: existing.gender,
          dateOfBirth: existing.dateOfBirth,
          nationalId: existing.nationalId,
          gradeId,
          guardianName: existing.guardianName,
          guardianPhone: existing.guardianPhone,
          guardianEmail: existing.guardianEmail,
          address: existing.guardianAddress,
          photoUrl: existing.studentPhoto,
          status: 'active',
        },
      })

      // Update application with enrollment info
      const application = await db.registrationApplication.update({
        where: { id },
        data: {
          status: 'enrolled',
          admissionNumber,
          enrollRemarks: remarks || existing.enrollRemarks,
          enrolledAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: user.id,
          reviewedByName: user.name,
        },
      })

      return NextResponse.json({
        application,
        student,
        admissionNumber,
        studentEmail: defaultEmail,
        message: `Student enrolled successfully. Admission Number: ${admissionNumber}. Login email: ${defaultEmail}`,
      })
    }

    // Handle payment setup (admin/super_admin)
    const updateData: any = {}
    if (status) updateData.status = status
    if (remarks !== undefined) updateData.remarks = remarks
    if (payCode !== undefined) updateData.payCode = payCode
    if (paymentAmount !== undefined) updateData.paymentAmount = parseFloat(paymentAmount) || 0
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod
    if (status || remarks !== undefined) {
      updateData.reviewedAt = new Date()
      updateData.reviewedBy = user.id
      updateData.reviewedByName = user.name
    }

    const application = await db.registrationApplication.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('PUT /api/registrations/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}

// DELETE /api/registrations/[id] - delete application (admin/super_admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.registrationApplication.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    await db.registrationApplication.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/registrations/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}
