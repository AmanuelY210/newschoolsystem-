import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/languages/[id]/translations - get all translations for a language
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const translations = await db.translation.findMany({
      where: { languageId: id },
      orderBy: { key: 'asc' },
    })

    // Return as key-value object
    const result: Record<string, string> = {}
    for (const t of translations) {
      result[t.key] = t.value
    }

    return NextResponse.json({ translations: result })
  } catch (error) {
    console.error('GET translations error:', error)
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}

// PUT /api/languages/[id]/translations - bulk update translations (super_admin only)
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
    const language = await db.language.findUnique({ where: { id } })
    if (!language) return NextResponse.json({ error: 'Language not found' }, { status: 404 })

    const body = await req.json()
    const { translations } = body // { "key": "value", ... }

    if (!translations || typeof translations !== 'object') {
      return NextResponse.json({ error: 'Translations object required' }, { status: 400 })
    }

    // Upsert each translation
    const operations = Object.entries(translations).map(([key, value]) =>
      db.translation.upsert({
        where: { languageId_key: { languageId: id, key } },
        create: { languageId: id, key, value: String(value) },
        update: { value: String(value) },
      })
    )

    await db.$transaction(operations)

    return NextResponse.json({ success: true, count: operations.length })
  } catch (error) {
    console.error('PUT translations error:', error)
    return NextResponse.json({ error: 'Failed to update translations' }, { status: 500 })
  }
}
