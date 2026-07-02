import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/books - list books
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
        { bookId: { contains: search } },
      ]
    }

    const books = await db.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error('GET /api/books error:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

// POST /api/books - create book
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'library.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      edition,
      year,
      totalCopies,
      shelfLocation,
      description,
      coverUrl,
    } = body

    if (!title || !author) {
      return NextResponse.json({ error: 'Missing required fields (title, author)' }, { status: 400 })
    }

    const copies = totalCopies ? parseInt(totalCopies, 10) : 1

    // Generate bookId as BK-XXX
    const count = await db.book.count()
    const bookId = `BK-${String(count + 1).padStart(3, '0')}`

    const book = await db.book.create({
      data: {
        bookId,
        title,
        author,
        isbn: isbn || null,
        category: category || 'general',
        publisher: publisher || null,
        edition: edition || null,
        year: year ? parseInt(year, 10) : null,
        totalCopies: copies,
        availableCopies: copies,
        shelfLocation: shelfLocation || null,
        description: description || null,
        coverUrl: coverUrl || null,
        status: copies > 0 ? 'available' : 'borrowed',
      },
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    console.error('POST /api/books error:', error)
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}
