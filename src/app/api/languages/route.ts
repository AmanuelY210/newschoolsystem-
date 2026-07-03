import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/languages - list all languages (public for enabled, all for super_admin)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const isSuperAdmin = user?.role === 'super_admin'

    const where = isSuperAdmin ? {} : { enabled: true }

    const languages = await db.language.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: {
        _count: { select: { translations: true } },
      },
    })

    return NextResponse.json({ languages })
  } catch (error) {
    console.error('GET /api/languages error:', error)
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 })
  }
}

// POST /api/languages - create language (super_admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })
    }

    const body = await req.json()
    const { code, name, nativeName, flag, enabled, isDefault } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and name are required' }, { status: 400 })
    }

    // Check if code already exists
    const existing = await db.language.findUnique({ where: { code: code.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Language code already exists' }, { status: 400 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }

    const language = await db.language.create({
      data: {
        code: code.toLowerCase(),
        name,
        nativeName: nativeName || null,
        flag: flag || null,
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        isDefault: Boolean(isDefault),
      },
    })

    return NextResponse.json({ language }, { status: 201 })
  } catch (error) {
    console.error('POST /api/languages error:', error)
    return NextResponse.json({ error: 'Failed to create language' }, { status: 500 })
  }
}
