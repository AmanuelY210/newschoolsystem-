import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/finance - list transactions
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const paymentMethod = searchParams.get('paymentMethod')
    const status = searchParams.get('status')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (type) where.type = type
    if (category) where.category = category
    if (paymentMethod) where.paymentMethod = paymentMethod
    if (status) where.status = status

    const transactions = await db.financeTransaction.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('GET /api/finance error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST /api/finance - create transaction
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'finance.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      studentId,
      type,
      category,
      amount,
      paymentMethod,
      bankReference,
      description,
      status,
    } = body

    if (!type || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Missing required fields (type, amount)' }, { status: 400 })
    }

    // Generate transactionId as TXN-2024-XXXX
    const count = await db.financeTransaction.count()
    const transactionId = `TXN-2024-${String(count + 1).padStart(4, '0')}`

    const transaction = await db.financeTransaction.create({
      data: {
        transactionId,
        studentId: studentId || null,
        type,
        category: category || 'tuition',
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'cash',
        bankReference: bankReference || null,
        description: description || null,
        status: status || 'completed',
        date: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('POST /api/finance error:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
