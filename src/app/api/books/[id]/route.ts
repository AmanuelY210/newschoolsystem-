import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    const { id } = await params
    const book = await db.book.findUnique({
      where: { id },
      include: {
        loans: {
          include: {
            student: {
              select: { id: true, studentId: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

    return NextResponse.json({ book })
  } catch (error) {
    console.error('GET /api/books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'library.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await db.book.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

    // If totalCopies is being updated and availableCopies was at full capacity, sync availableCopies
    let availableCopies: number | undefined
    if (body.totalCopies !== undefined) {
      const newTotal = parseInt(body.totalCopies, 10)
      const borrowedCount = existing.totalCopies - existing.availableCopies
      availableCopies = Math.max(0, newTotal - borrowedCount)
    }

    const book = await db.book.update({
      where: { id },
      data: {
        title: body.title,
        author: body.author,
        isbn: body.isbn,
        category: body.category,
        publisher: body.publisher,
        edition: body.edition,
        year: body.year !== undefined ? parseInt(body.year, 10) : undefined,
        totalCopies: body.totalCopies !== undefined ? parseInt(body.totalCopies, 10) : undefined,
        availableCopies,
        shelfLocation: body.shelfLocation,
        description: body.description,
        coverUrl: body.coverUrl,
        status: body.status,
      },
    })

    return NextResponse.json({ book })
  } catch (error) {
    console.error('PUT /api/books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'library.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.book.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

    await db.book.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
