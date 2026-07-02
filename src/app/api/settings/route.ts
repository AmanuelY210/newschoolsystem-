import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/settings - get all site settings (public access)
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()
    const settingsObject: Record<string, string> = {}
    for (const s of settings) {
      settingsObject[s.key] = s.value
    }
    return NextResponse.json({ settings: settingsObject })
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/settings - update settings (super_admin only)
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be a key-value object' }, { status: 400 })
    }

    // Upsert each key
    const operations = Object.entries(body).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )

    await db.$transaction(operations)

    // Return all settings
    const settings = await db.siteSetting.findMany()
    const settingsObject: Record<string, string> = {}
    for (const s of settings) {
      settingsObject[s.key] = s.value
    }

    return NextResponse.json({ settings: settingsObject })
  } catch (error) {
    console.error('PUT /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
