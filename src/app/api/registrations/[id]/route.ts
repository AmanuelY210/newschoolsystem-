import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/registrations/[id] - update application status (admin/super_admin only)
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
    const { status, remarks } = body

    if (status && !['pending', 'approved', 'rejected', 'enrolled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, approved, rejected, or enrolled' },
        { status: 400 }
      )
    }

    const application = await db.registrationApplication.update({
      where: { id },
      data: {
        status: status || existing.status,
        remarks: remarks !== undefined ? remarks : existing.remarks,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
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
