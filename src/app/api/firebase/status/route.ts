import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { firebaseSetStatus, firebaseGet } from '@/lib/firebase'

// GET /api/firebase/status - get system status from Firebase
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    if (key) {
      const status = await firebaseGet(`status/${key}`)
      return NextResponse.json({ status })
    }

    const allStatus = await firebaseGet('status')
    return NextResponse.json({ status: allStatus })
  } catch (error) {
    console.error('Firebase status get error:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

// POST /api/firebase/status - update system status
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { key, data } = body

    await firebaseSetStatus(key, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Firebase status update error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
