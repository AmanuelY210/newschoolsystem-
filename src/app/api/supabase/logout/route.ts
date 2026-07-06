import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/supabase/logout - Logout from Supabase
export async function POST(req: NextRequest) {
  try {
    // Get the access token from the request
    const authHeader = req.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (accessToken) {
      // Set the session on the server client
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      })
      // Sign out
      await supabase.auth.signOut()
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Supabase logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
