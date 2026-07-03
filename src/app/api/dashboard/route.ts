import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = user.role

    // Fetch events for all roles (upcoming)
    const events = await db.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 5,
    })

    if (['super_admin', 'admin'].includes(role)) {
      const [totalStudents, totalTeachers, totalBooks, totalTransactions, pendingApplications] =
        await Promise.all([
          db.student.count({ where: { status: 'active' } }),
          db.teacher.count({ where: { status: 'active' } }),
          db.book.count(),
          db.financeTransaction.count(),
          db.registrationApplication.count({ where: { status: 'pending' } }),
        ])

      const revenueAgg = await db.financeTransaction.aggregate({
        where: { type: { in: ['income', 'fee_payment'] }, status: 'completed' },
        _sum: { amount: true },
      })

      // Monthly trend - last 6 months
      const now = new Date()
      const monthlyTrend: any[] = []
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const monthAgg = await db.financeTransaction.aggregate({
          where: {
            type: { in: ['income', 'fee_payment'] },
            status: 'completed',
            date: { gte: monthStart, lt: monthEnd },
          },
          _sum: { amount: true },
        })
        monthlyTrend.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          amount: monthAgg._sum.amount || 0,
        })
      }

      // Recent activities
      const [recentTransactions, recentMessages, recentApplications] = await Promise.all([
        db.financeTransaction.findMany({
          take: 5,
          orderBy: { date: 'desc' },
          include: { student: { select: { firstName: true, lastName: true } } },
        }),
        db.contactMessage.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
        db.registrationApplication.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      ])

      const activities: any[] = []
      for (const t of recentTransactions) {
        activities.push({
          title: `Payment: ${t.transactionId}`,
          description: `${t.type} - ${t.amount.toLocaleString()} ETB`,
          time: t.date.toISOString(),
        })
      }
      for (const m of recentMessages) {
        activities.push({
          title: `Message from ${m.name}`,
          description: m.subject,
          time: m.createdAt.toISOString(),
        })
      }
      for (const a of recentApplications) {
        activities.push({
          title: `Application: ${a.firstName} ${a.lastName}`,
          description: `App ID: ${a.applicationId}`,
          time: a.createdAt.toISOString(),
        })
      }
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      return NextResponse.json({
        role,
        stats: {
          totalStudents,
          totalTeachers,
          totalBooks,
          totalTransactions,
          pendingApplications,
          totalRevenue: revenueAgg._sum.amount || 0,
          monthlyTrend,
        },
        activities: activities.slice(0, 8),
        events,
      })
    }

    if (role === 'teacher') {
      const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
      if (!teacher) return NextResponse.json({ role, stats: {}, activities: [], events })

      const [assignmentCount, submissions, recentSubmissions] = await Promise.all([
        db.assignment.count({ where: { teacherId: teacher.id } }),
        db.assignmentSubmission.count({
          where: { assignment: { teacherId: teacher.id } },
        }),
        db.assignmentSubmission.findMany({
          where: { assignment: { teacherId: teacher.id } },
          take: 8,
          orderBy: { submittedAt: 'desc' },
          include: {
            student: { select: { firstName: true, lastName: true, studentId: true } },
            assignment: { select: { title: true } },
          },
        }),
      ])

      const studentCount = await db.mark.findMany({
        where: { teacherId: teacher.id },
        select: { studentId: true },
        distinct: ['studentId'],
      })

      const pendingReview = await db.assignmentSubmission.count({
        where: { assignment: { teacherId: teacher.id }, status: 'submitted' },
      })

      const activities = recentSubmissions.map((s) => ({
        title: `Submission from ${s.student.firstName} ${s.student.lastName}`,
        description: `Assignment: ${s.assignment.title}`,
        time: s.submittedAt.toISOString(),
      }))

      return NextResponse.json({
        role,
        stats: {
          totalStudents: studentCount.length,
          totalAssignments: assignmentCount,
          totalSubmissions: submissions,
          pendingReview,
        },
        activities,
        events,
      })
    }

    if (role === 'student') {
      const student = await db.student.findUnique({
        where: { userId: user.id },
        include: { grade: true },
      })
      if (!student) return NextResponse.json({ role, stats: {}, activities: [], events })

      const [marks, attendance, assignments, libraryLoans] = await Promise.all([
        db.mark.findMany({
          where: { studentId: student.id },
          include: { subject: true },
        }),
        db.attendance.findMany({ where: { studentId: student.id } }),
        db.assignment.findMany({
          where: {
            subject: { gradeId: student.gradeId ?? undefined },
            status: 'active',
            dueDate: { gte: new Date() },
          },
          include: { subject: true },
          orderBy: { dueDate: 'asc' },
          take: 10,
        }),
        db.libraryLoan.findMany({
          where: { studentId: student.id, status: { in: ['borrowed', 'overdue'] } },
          include: { book: true },
        }),
      ])

      const totalScore = marks.reduce((sum, m) => sum + m.score, 0)
      const totalMax = marks.reduce((sum, m) => sum + m.totalScore, 0)
      const average = totalMax > 0 ? (totalScore / totalMax) * 100 : 0

      const presentDays = attendance.filter((a) => a.status === 'present').length
      const absentDays = attendance.filter((a) => a.status === 'absent').length
      const attendancePercent =
        attendance.length > 0 ? (presentDays / attendance.length) * 100 : 0

      // Compute rank among classmates
      const classmates = await db.mark.findMany({
        where: { student: { gradeId: student.gradeId ?? undefined } },
        select: { studentId: true, score: true, totalScore: true },
      })
      const studentTotals = new Map<string, number>()
      const studentMaxes = new Map<string, number>()
      for (const m of classmates) {
        studentTotals.set(m.studentId, (studentTotals.get(m.studentId) || 0) + m.score)
        studentMaxes.set(m.studentId, (studentMaxes.get(m.studentId) || 0) + m.totalScore)
      }
      const percentages: Array<{ id: string; pct: number }> = []
      studentTotals.forEach((total, sid) => {
        const max = studentMaxes.get(sid) || 1
        percentages.push({ id: sid, pct: max > 0 ? (total / max) * 100 : 0 })
      })
      percentages.sort((a, b) => b.pct - a.pct)
      const rank = percentages.findIndex((p) => p.id === student.id) + 1

      const activities = assignments.slice(0, 5).map((a) => ({
        title: `Assignment due: ${a.title}`,
        description: `Subject: ${a.subject.name} | Due: ${new Date(a.dueDate).toLocaleDateString()}`,
        time: a.createdAt.toISOString(),
      }))

      return NextResponse.json({
        role,
        stats: {
          averageScore: Math.round(average),
          rank: rank || 'N/A',
          assignmentsDue: assignments.length,
          booksBorrowed: libraryLoans.length,
          attendancePercentage: Math.round(attendancePercent),
          presentDays,
          absentDays,
        },
        activities,
        events,
      })
    }

    if (role === 'finance') {
      const [revenueAgg, expenseAgg, pendingAgg, txnCount, recentTransactions] = await Promise.all([
        db.financeTransaction.aggregate({
          where: { type: { in: ['income', 'fee_payment'] }, status: 'completed' },
          _sum: { amount: true },
        }),
        db.financeTransaction.aggregate({
          where: { type: { in: ['expense', 'salary'] }, status: 'completed' },
          _sum: { amount: true },
        }),
        db.financeTransaction.aggregate({
          where: { status: 'pending' },
          _sum: { amount: true },
        }),
        db.financeTransaction.count(),
        db.financeTransaction.findMany({
          take: 8,
          orderBy: { date: 'desc' },
          include: { student: { select: { firstName: true, lastName: true, studentId: true } } },
        }),
      ])

      // Monthly revenue
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyAgg = await db.financeTransaction.aggregate({
        where: {
          type: { in: ['income', 'fee_payment'] },
          status: 'completed',
          date: { gte: monthStart },
        },
        _sum: { amount: true },
      })

      const activities = recentTransactions.map((t) => ({
        title: `${t.type}: ${t.transactionId}`,
        description: `${t.student ? `${t.student.firstName} ${t.student.lastName}` : 'N/A'} - ${t.amount.toLocaleString()} ETB`,
        time: t.date.toISOString(),
      }))

      return NextResponse.json({
        role,
        stats: {
          totalRevenue: revenueAgg._sum.amount || 0,
          totalExpenses: expenseAgg._sum.amount || 0,
          pendingFees: pendingAgg._sum.amount || 0,
          totalTransactions: txnCount,
          monthlyRevenue: monthlyAgg._sum.amount || 0,
          monthlyTrend: [],
        },
        activities,
        events,
      })
    }

    if (role === 'library') {
      const [totalBooks, totalCopiesAgg, availableCopiesAgg, borrowedLoans, overdueLoans] = await Promise.all([
        db.book.count(),
        db.book.aggregate({ _sum: { totalCopies: true } }),
        db.book.aggregate({ _sum: { availableCopies: true } }),
        db.libraryLoan.count({ where: { status: 'borrowed' } }),
        db.libraryLoan.count({
          where: {
            status: 'borrowed',
            dueDate: { lt: new Date() },
          },
        }),
      ])

      const recentLoans = await db.libraryLoan.findMany({
        take: 8,
        orderBy: { borrowDate: 'desc' },
        include: { book: true, student: { select: { firstName: true, lastName: true } } },
      })

      const activities = recentLoans.map((l) => ({
        title: `Book issued: ${l.book.title}`,
        description: `Borrower: ${l.borrowerName}`,
        time: l.borrowDate.toISOString(),
      }))

      return NextResponse.json({
        role,
        stats: {
          totalBooks,
          availableBooks: availableCopiesAgg._sum.availableCopies || 0,
          borrowedBooks: borrowedLoans,
          overdueLoans,
        },
        activities,
        events,
      })
    }

    return NextResponse.json({ role, stats: {}, activities: [], events })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
