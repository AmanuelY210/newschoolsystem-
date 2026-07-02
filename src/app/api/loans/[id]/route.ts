import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'

// PUT /api/loans/[id] - update loan (e.g. return book)
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

    const existing = await db.libraryLoan.findUnique({
      where: { id },
      include: { book: true },
    })
    if (!existing) return NextResponse.json({ error: 'Loan not found' }, { status: 404 })

    const wasReturned = existing.status === 'returned'

    // Returning book: status becomes 'returned' and returnDate set
    const isReturning =
      (body.status === 'returned' && !wasReturned) ||
      (body.returnDate && !wasReturned)

    let fine = existing.fine
    if (isReturning) {
      const now = new Date()
      const due = new Date(existing.dueDate)
      if (now > due) {
        // Calculate overdue days; fine: 5 per day (configurable)
        const diffMs = now.getTime() - due.getTime()
        const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        fine = overdueDays * 5
      }
    }

    const updatedLoan = await db.libraryLoan.update({
      where: { id },
      data: {
        returnDate: body.returnDate ? new Date(body.returnDate) : isReturning ? new Date() : existing.returnDate,
        status: body.status || (isReturning ? 'returned' : existing.status),
        fine: body.fine !== undefined ? parseFloat(body.fine) : fine,
        remarks: body.remarks,
        borrowerName: body.borrowerName,
        borrowerType: body.borrowerType,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
      include: {
        book: true,
        student: {
          select: { id: true, studentId: true, firstName: true, lastName: true },
        },
      },
    })

    // If transitioning to returned, increment book.availableCopies
    if (isReturning && !wasReturned) {
      await db.book.update({
        where: { id: existing.bookId },
        data: {
          availableCopies: { increment: 1 },
          status:
            updatedLoan.book.availableCopies + 1 >= updatedLoan.book.totalCopies
              ? 'available'
              : updatedLoan.book.status,
        },
      })
    }

    return NextResponse.json({ loan: updatedLoan })
  } catch (error) {
    console.error('PUT /api/loans/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 })
  }
}

// DELETE /api/loans/[id]
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
    const existing = await db.libraryLoan.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Loan not found' }, { status: 404 })

    // If loan was not returned, restore the book copy
    if (existing.status !== 'returned') {
      await db.book.update({
        where: { id: existing.bookId },
        data: { availableCopies: { increment: 1 } },
      })
    }

    await db.libraryLoan.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/loans/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete loan' }, { status: 500 })
  }
}
