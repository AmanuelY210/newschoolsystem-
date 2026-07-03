import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/registrations/track/[trackingNumber] - public tracking (no auth)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params
    const tracking = trackingNumber.trim().toUpperCase()

    const application = await db.registrationApplication.findUnique({
      where: { trackingNumber: tracking },
      select: {
        applicationId: true,
        trackingNumber: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        applyForGrade: true,
        program: true,
        field: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        enrolledAt: true,
        remarks: true,
        enrollRemarks: true,
        paymentAmount: true,
        paymentMethod: true,
        payCode: true,
        reviewedByName: true,
        guardianName: true,
        guardianPhone: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Tracking number not found. Please check and try again.' }, { status: 404 })
    }

    // Build status timeline
    const timeline: any[] = []
    timeline.push({
      step: 'Application Submitted',
      status: 'completed',
      date: application.submittedAt,
      description: `Your application (${application.applicationId}) has been submitted successfully.`,
    })

    if (application.status === 'rejected') {
      timeline.push({
        step: 'Application Rejected',
        status: 'rejected',
        date: application.reviewedAt,
        description: application.remarks || 'Your application has been rejected. Please contact the school for more information.',
      })
    } else {
      if (['under_review', 'approved', 'enrolled'].includes(application.status)) {
        timeline.push({
          step: 'Under Review',
          status: 'completed',
          date: application.reviewedAt,
          description: 'Your application is being reviewed by our admissions team.',
        })
      } else {
        timeline.push({
          step: 'Under Review',
          status: 'pending',
          date: null,
          description: 'Waiting for admin to review your application.',
        })
      }

      if (['approved', 'enrolled'].includes(application.status)) {
        timeline.push({
          step: 'Application Approved',
          status: 'completed',
          date: application.reviewedAt,
          description: 'Congratulations! Your application has been approved.',
        })
      } else if (application.status !== 'under_review') {
        timeline.push({
          step: 'Application Approved',
          status: 'pending',
          date: null,
          description: 'Awaiting approval decision.',
        })
      }

      if (application.status === 'enrolled') {
        timeline.push({
          step: 'Enrolled',
          status: 'completed',
          date: application.enrolledAt,
          description: `You have been successfully enrolled! Admission Number: ${application.admissionNumber}`,
        })
      } else {
        timeline.push({
          step: 'Enrolled',
          status: 'pending',
          date: null,
          description: 'Final enrollment step.',
        })
      }
    }

    return NextResponse.json({ application, timeline })
  } catch (error) {
    console.error('Track error:', error)
    return NextResponse.json({ error: 'Failed to track application' }, { status: 500 })
  }
}
