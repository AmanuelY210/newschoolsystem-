import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/idcards - list ID cards
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const personType = searchParams.get('personType')

    const where: any = {}
    if (personType) where.personType = personType

    const cards = await db.iDCard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('GET /api/idcards error:', error)
    return NextResponse.json({ error: 'Failed to fetch ID cards' }, { status: 500 })
  }
}

// POST /api/idcards - create ID card (permission: idcard.create)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'idcard.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { personId, personType, personName, expiryDate } = body

    if (!personId || !personName) {
      return NextResponse.json(
        { error: 'Missing required fields (personId, personName)' },
        { status: 400 }
      )
    }

    // Generate cardNumber: IDC-YYYY-XXXX
    const count = await db.iDCard.count()
    const year = new Date().getFullYear()
    const cardNumber = `IDC-${year}-${String(count + 1).padStart(4, '0')}`

    const card = await db.iDCard.create({
      data: {
        personId,
        personType: personType || 'student',
        personName,
        cardNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    })

    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    console.error('POST /api/idcards error:', error)
    return NextResponse.json({ error: 'Failed to create ID card' }, { status: 500 })
  }
}
