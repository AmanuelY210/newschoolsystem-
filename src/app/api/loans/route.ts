import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// GET /api/loans - list loans
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (status) where.status = status

    const loans = await db.libraryLoan.findMany({
      where,
      include: {
        book: true,
        student: {
          select: { id: true, studentId: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ loans })
  } catch (error) {
    console.error('GET /api/loans error:', error)
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 })
  }
}

// POST /api/loans - create loan
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!hasPermission(user.role, 'library.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { bookId, studentId, borrowerName, borrowerType, dueDate } = body

    if (!bookId || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields (bookId, dueDate)' }, { status: 400 })
    }

    const book = await db.book.findUnique({ where: { id: bookId } })
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    if (book.availableCopies <= 0) {
      return NextResponse.json({ error: 'No available copies of this book' }, { status: 400 })
    }

    // Determine borrower name
    let finalBorrowerName = borrowerName
    if (!finalBorrowerName && studentId) {
      const student = await db.student.findUnique({ where: { id: studentId } })
      if (student) {
        finalBorrowerName = `${student.firstName} ${student.lastName}`
      }
    }
    if (!finalBorrowerName) {
      return NextResponse.json({ error: 'borrowerName is required' }, { status: 400 })
    }

    // Create loan + decrement available copies atomically
    const [loan] = await db.$transaction([
      db.libraryLoan.create({
        data: {
          bookId,
          studentId: studentId || null,
          borrowerName: finalBorrowerName,
          borrowerType: borrowerType || 'student',
          dueDate: new Date(dueDate),
          status: 'borrowed',
        },
        include: {
          book: true,
          student: {
            select: { id: true, studentId: true, firstName: true, lastName: true },
          },
        },
      }),
      db.book.update({
        where: { id: bookId },
        data: {
          availableCopies: { decrement: 1 },
          status: book.availableCopies - 1 <= 0 ? 'borrowed' : 'available',
        },
      }),
    ])

    return NextResponse.json({ loan }, { status: 201 })
  } catch (error) {
    console.error('POST /api/loans error:', error)
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 })
  }
}
