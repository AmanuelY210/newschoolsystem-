import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/languages/user - update current user's preferred language
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { language } = body // language code e.g. "en", "am"

    if (!language) {
      return NextResponse.json({ error: 'Language code required' }, { status: 400 })
    }

    // Verify the language exists and is enabled
    const lang = await db.language.findUnique({
      where: { code: language.toLowerCase() },
    })

    if (!lang || !lang.enabled) {
      return NextResponse.json({ error: 'Language not available' }, { status: 400 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { language: lang.code },
    })

    return NextResponse.json({ success: true, language: lang.code })
  } catch (error) {
    console.error('Update user language error:', error)
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 })
  }
}
