import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/supabase/session - Get current Supabase session
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ user: null, session: null })
    }

    // Get user from access token
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (error || !data.user) {
      return NextResponse.json({ user: null, session: null })
    }

    const user = data.user

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: user.user_metadata?.role || 'student',
        avatar: user.user_metadata?.avatar || null,
      },
      session: {
        access_token: accessToken,
      },
    })
  } catch (error) {
    console.error('Supabase session error:', error)
    return NextResponse.json({ user: null, session: null })
  }
}
