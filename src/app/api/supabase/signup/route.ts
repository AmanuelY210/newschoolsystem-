import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/supabase/signup - Register new user with Supabase Auth
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          role: role || 'student',
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      message: data.session
        ? 'Account created successfully'
        : 'Account created! Check your email for verification.',
    }, { status: 201 })
  } catch (error) {
    console.error('Supabase signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
