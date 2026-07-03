import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/languages/[id] - get language with translations
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const language = await db.language.findUnique({
      where: { id },
      include: { translations: true },
    })

    if (!language) return NextResponse.json({ error: 'Language not found' }, { status: 404 })

    return NextResponse.json({ language })
  } catch (error) {
    console.error('GET language error:', error)
    return NextResponse.json({ error: 'Failed to fetch language' }, { status: 500 })
  }
}

// PUT /api/languages/[id] - update language (super_admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.language.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Language not found' }, { status: 404 })

    const body = await req.json()
    const { name, nativeName, flag, enabled, isDefault, code } = body

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await db.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }

    // Prevent disabling the default language
    if (enabled === false && existing.isDefault) {
      return NextResponse.json(
        { error: 'Cannot disable the default language. Set another language as default first.' },
        { status: 400 }
      )
    }

    const language = await db.language.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        nativeName: nativeName !== undefined ? nativeName : undefined,
        flag: flag !== undefined ? flag : undefined,
        enabled: enabled !== undefined ? Boolean(enabled) : undefined,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
        code: code !== undefined ? code.toLowerCase() : undefined,
      },
    })

    return NextResponse.json({ language })
  } catch (error) {
    console.error('PUT language error:', error)
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 })
  }
}

// DELETE /api/languages/[id] - delete language (super_admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.language.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Language not found' }, { status: 404 })

    // Prevent deleting the default language
    if (existing.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete the default language. Set another language as default first.' },
        { status: 400 }
      )
    }

    await db.language.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE language error:', error)
    return NextResponse.json({ error: 'Failed to delete language' }, { status: 500 })
  }
}
