import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { firebaseSync, firebaseUnsync, firebaseGetCollection, firebaseBroadcast } from '@/lib/firebase'

// POST /api/firebase/sync - sync a record to Firebase
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { collection, id, data, action } = body

    if (action === 'delete') {
      await firebaseUnsync(collection, id)
      // Broadcast deletion
      await firebaseBroadcast(collection, { action: 'delete', id })
      return NextResponse.json({ success: true, action: 'deleted' })
    }

    if (action === 'broadcast') {
      await firebaseBroadcast(collection, data)
      return NextResponse.json({ success: true, action: 'broadcasted' })
    }

    // Default: sync (create/update)
    await firebaseSync(collection, id, data)
    // Broadcast update to all listeners
    await firebaseBroadcast(collection, { action: 'update', id, data })

    return NextResponse.json({ success: true, action: 'synced' })
  } catch (error) {
    console.error('Firebase sync error:', error)
    return NextResponse.json({ error: 'Failed to sync to Firebase' }, { status: 500 })
  }
}

// GET /api/firebase/sync?collection=students - get all records from a collection
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const collection = searchParams.get('collection')

    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter required' }, { status: 400 })
    }

    const data = await firebaseGetCollection(collection)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Firebase get error:', error)
    return NextResponse.json({ error: 'Failed to fetch from Firebase' }, { status: 500 })
  }
}
