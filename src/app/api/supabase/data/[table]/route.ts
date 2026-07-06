import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/supabase/data/[table] - fetch data from Supabase table
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params
    const { searchParams } = new URL(req.url)
    const select = searchParams.get('select') || '*'
    const limit = searchParams.get('limit') || '100'
    const filter = searchParams.get('filter') // e.g., "column=eq.value"

    let query = supabase.from(table).select(select).limit(parseInt(limit))

    // Apply filter if provided
    if (filter) {
      const [col, rest] = filter.split('=')
      const [op, val] = rest.split('.')
      if (op && val) {
        query = query.filter(col, op, val)
      }
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Supabase data GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// POST /api/supabase/data/[table] - insert data into Supabase table
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params
    const body = await req.json()

    const { data, error } = await supabase.from(table).insert(body).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Supabase data POST error:', error)
    return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 })
  }
}
