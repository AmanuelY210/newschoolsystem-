import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'grade.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, minPercentage, maxPercentage, grade, gradePoint, description } = body

    const gradingSystem = await db.gradingSystem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(minPercentage !== undefined && { minPercentage: Number(minPercentage) }),
        ...(maxPercentage !== undefined && { maxPercentage: Number(maxPercentage) }),
        ...(grade !== undefined && { grade }),
        ...(gradePoint !== undefined && { gradePoint: Number(gradePoint) }),
        ...(description !== undefined && { description }),
      },
    })

    return NextResponse.json({ gradingSystem })
  } catch (error) {
    console.error('PUT grading-system error:', error)
    return NextResponse.json({ error: 'Failed to update grading system' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'grade.*')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await db.gradingSystem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE grading-system error:', error)
    return NextResponse.json({ error: 'Failed to delete grading system' }, { status: 500 })
  }
}
