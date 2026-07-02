import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// PUT /api/hr/[id] - update HR staff (permission: hr.edit)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'hr.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.hRStaff.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

    const body = await req.json()

    // If staffId is being changed, ensure it doesn't collide
    if (body.staffId && body.staffId !== existing.staffId) {
      const collision = await db.hRStaff.findUnique({ where: { staffId: body.staffId } })
      if (collision) {
        return NextResponse.json({ error: 'staffId already exists' }, { status: 400 })
      }
    }

    const staff = await db.hRStaff.update({
      where: { id },
      data: {
        staffId: body.staffId,
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        department: body.department,
        position: body.position,
        phone: body.phone,
        email: body.email,
        salary: body.salary !== undefined ? parseFloat(body.salary) : undefined,
        status: body.status,
      },
    })

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('PUT /api/hr/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update HR staff' }, { status: 500 })
  }
}

// DELETE /api/hr/[id] - delete HR staff (permission: hr.delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'hr.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.hRStaff.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

    await db.hRStaff.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/hr/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete HR staff' }, { status: 500 })
  }
}
