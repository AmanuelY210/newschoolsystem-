import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/supabase/login - Login with Supabase Auth
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    const user = data.user
    const session = data.session

    // Try to get user role from our database (if available)
    // For now, determine role from email
    let role = 'student'
    if (email.includes('superadmin')) role = 'super_admin'
    else if (email.includes('admin')) role = 'admin'
    else if (email.includes('teacher')) role = 'teacher'
    else if (email.includes('finance')) role = 'finance'
    else if (email.includes('library')) role = 'library'

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || email.split('@')[0],
        role: user.user_metadata?.role || role,
        avatar: user.user_metadata?.avatar || null,
      },
      session: {
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
        expires_at: session?.expires_at,
      },
    })
  } catch (error) {
    console.error('Supabase login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
