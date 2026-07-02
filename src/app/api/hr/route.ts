import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/hr - list HR staff
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'hr.view') && !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    const where: any = {}
    if (department) where.department = department
    if (status) where.status = status

    const staff = await db.hRStaff.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('GET /api/hr error:', error)
    return NextResponse.json({ error: 'Failed to fetch HR staff' }, { status: 500 })
  }
}

// POST /api/hr - create HR staff (permission: hr.create - super_admin, admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'hr.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      staffId,
      firstName,
      lastName,
      gender,
      department,
      position,
      phone,
      email,
      salary,
    } = body

    if (!firstName || !lastName || !position) {
      return NextResponse.json(
        { error: 'Missing required fields (firstName, lastName, position)' },
        { status: 400 }
      )
    }

    // Generate staffId if not provided: HR-YYYY-XXXX
    let finalStaffId = staffId
    if (!finalStaffId) {
      const count = await db.hRStaff.count()
      const year = new Date().getFullYear()
      finalStaffId = `HR-${year}-${String(count + 1).padStart(4, '0')}`
    } else {
      // Ensure uniqueness
      const exists = await db.hRStaff.findUnique({ where: { staffId: finalStaffId } })
      if (exists) {
        return NextResponse.json({ error: 'staffId already exists' }, { status: 400 })
      }
    }

    const staff = await db.hRStaff.create({
      data: {
        staffId: finalStaffId,
        firstName,
        lastName,
        gender: gender || 'male',
        department: department || 'academic',
        position,
        phone: phone || null,
        email: email || null,
        salary: salary ? parseFloat(salary) : 0,
      },
    })

    return NextResponse.json({ staff }, { status: 201 })
  } catch (error) {
    console.error('POST /api/hr error:', error)
    return NextResponse.json({ error: 'Failed to create HR staff' }, { status: 500 })
  }
}
