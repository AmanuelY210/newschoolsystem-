import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/finance/summary - finance summary
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Total income (income + fee_payment types completed)
    const incomeAgg = await db.financeTransaction.aggregate({
      where: {
        type: { in: ['income', 'fee_payment'] },
        status: 'completed',
      },
      _sum: { amount: true },
    })

    // Total expenses
    const expenseAgg = await db.financeTransaction.aggregate({
      where: {
        type: { in: ['expense', 'salary'] },
        status: 'completed',
      },
      _sum: { amount: true },
    })

    // Total fee collected
    const feeCollectedAgg = await db.financeTransaction.aggregate({
      where: {
        type: 'fee_payment',
        status: 'completed',
      },
      _sum: { amount: true },
    })

    // Pending payments
    const pendingAgg = await db.financeTransaction.aggregate({
      where: { status: 'pending' },
      _sum: { amount: true },
    })

    // Count by paymentMethod
    const paymentMethods = await db.financeTransaction.groupBy({
      by: ['paymentMethod'],
      _count: { _all: true },
      _sum: { amount: true },
    })

    // Monthly trend (last 6 months)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const recentTxns = await db.financeTransaction.findMany({
      where: {
        date: { gte: sixMonthsAgo },
        status: 'completed',
      },
      select: { type: true, amount: true, date: true },
    })

    const monthlyTrend: Array<{ month: string; income: number; expense: number }> = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      const inMonth = recentTxns.filter((t) => t.date >= d && t.date < next)
      const income = inMonth
        .filter((t) => t.type === 'income' || t.type === 'fee_payment')
        .reduce((sum, t) => sum + t.amount, 0)
      const expense = inMonth
        .filter((t) => t.type === 'expense' || t.type === 'salary')
        .reduce((sum, t) => sum + t.amount, 0)
      monthlyTrend.push({ month: monthLabel, income, expense })
    }

    return NextResponse.json({
      totalIncome: incomeAgg._sum.amount || 0,
      totalExpenses: expenseAgg._sum.amount || 0,
      totalFeeCollected: feeCollectedAgg._sum.amount || 0,
      pendingPayments: pendingAgg._sum.amount || 0,
      countByPaymentMethod: paymentMethods.map((p) => ({
        paymentMethod: p.paymentMethod,
        count: p._count._all,
        total: p._sum.amount || 0,
      })),
      monthlyTrend,
    })
  } catch (error) {
    console.error('GET /api/finance/summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch finance summary' }, { status: 500 })
  }
}
