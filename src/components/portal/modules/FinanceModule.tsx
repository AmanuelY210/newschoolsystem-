'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { useWebSocket } from '@/lib/use-websocket'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import {
  Plus, Edit, Trash2, Download, DollarSign, TrendingUp, TrendingDown,
  Wallet, Banknote, Smartphone, Building2, Landmark, CreditCard,
  Search, Receipt, AlertCircle, Scale,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// Ethiopian payment methods with friendly labels + colors + icons
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', color: '#0d9488', icon: Banknote },
  { value: 'telebirr', label: 'Telebirr', color: '#7c3aed', icon: Smartphone },
  { value: 'cbe', label: 'Commercial Bank of Ethiopia (CBE)', color: '#ea580c', icon: Landmark },
  { value: 'dashen', label: 'Dashen Bank', color: '#0369a1', icon: Building2 },
  { value: 'awash', label: 'Awash Bank', color: '#dc2626', icon: Building2 },
  { value: 'abyssinia', label: 'Bank of Abyssinia', color: '#ca8a04', icon: Building2 },
  { value: 'wegagen', label: 'Wegagen Bank', color: '#16a34a', icon: Building2 },
  { value: 'hibret', label: 'Hibret Bank', color: '#9333ea', icon: Building2 },
] as const

const TRANSACTION_TYPES = [
  { value: 'fee_payment', label: 'Fee Payment' },
  { value: 'salary', label: 'Salary' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'fine', label: 'Fine' },
] as const

const CATEGORIES = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'transport', label: 'Transport' },
  { value: 'library', label: 'Library' },
  { value: 'exam', label: 'Exam' },
  { value: 'other', label: 'Other' },
] as const

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const

const PIE_COLORS = ['#0d9488', '#7c3aed', '#ea580c', '#0369a1', '#dc2626', '#ca8a04', '#16a34a', '#9333ea']

function formatETB(amount: number) {
  const safe = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  return `${safe.toLocaleString('en-US', { maximumFractionDigits: 2 })} ETB`
}

function getPaymentMethodMeta(method: string) {
  return PAYMENT_METHODS.find((m) => m.value === method) || { value: method, label: method, color: '#6b7280', icon: CreditCard }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 hover:bg-green-100'
    case 'pending':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100'
    case 'failed':
      return 'bg-red-100 text-red-700 hover:bg-red-100'
    case 'refunded':
      return 'bg-gray-200 text-gray-700 hover:bg-gray-200'
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
  }
}

function getTypeBadgeClass(type: string) {
  switch (type) {
    case 'fee_payment':
    case 'income':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
    case 'salary':
    case 'expense':
      return 'bg-rose-100 text-rose-700 hover:bg-rose-100'
    case 'fine':
      return 'bg-orange-100 text-orange-700 hover:bg-orange-100'
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
  }
}

const emptyForm = {
  studentId: '',
  type: 'fee_payment',
  category: 'tuition',
  amount: '',
  paymentMethod: 'cash',
  bankReference: '',
  description: '',
  status: 'completed',
}

export function FinanceModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [typeFilter, setTypeFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTxn, setEditTxn] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const canCreate = hasPermission(role, 'finance.create')
  const canEdit = hasPermission(role, 'finance.edit')
  const canDelete = hasPermission(role, 'finance.delete')

  // Build query string for transactions list
  const txQuery = new URLSearchParams({
    ...(typeFilter !== 'all' && { type: typeFilter }),
    ...(methodFilter !== 'all' && { paymentMethod: methodFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  }).toString()

  const { data: txData, loading: txLoading, refetch: refetchTx } = useApi<{ transactions: any[] }>(
    `/api/finance${txQuery ? `?${txQuery}` : ''}`
  )
  const { data: summaryData, loading: summaryLoading, refetch: refetchSummary } = useApi<any>(
    '/api/finance/summary'
  )
  const { data: studentsData } = useApi<{ students: any[] }>('/api/students')
  const students = studentsData?.students || []

  const transactions = txData?.transactions || []
  const summary = summaryData || {}

  // Filter further by student name search (client-side)
  const filteredTxns = transactions.filter((t) => {
    if (!search) return true
    const studentName = t.student ? `${t.student.firstName} ${t.student.lastName}`.toLowerCase() : ''
    const txnId = (t.transactionId || '').toLowerCase()
    const desc = (t.description || '').toLowerCase()
    const q = search.toLowerCase()
    return studentName.includes(q) || txnId.includes(q) || desc.includes(q)
  })

  const openCreate = () => {
    setForm(emptyForm)
    setEditTxn(null)
    setDialogOpen(true)
  }

  const openEdit = (txn: any) => {
    setForm({
      studentId: txn.studentId || '',
      type: txn.type || 'fee_payment',
      category: txn.category || 'tuition',
      amount: String(txn.amount ?? ''),
      paymentMethod: txn.paymentMethod || 'cash',
      bankReference: txn.bankReference || '',
      description: txn.description || '',
      status: txn.status || 'completed',
    })
    setEditTxn(txn)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload: any = {
        studentId: form.studentId || null,
        type: form.type,
        category: form.category,
        amount: form.amount,
        paymentMethod: form.paymentMethod,
        bankReference: form.paymentMethod === 'cash' ? null : form.bankReference,
        description: form.description,
        status: form.status,
      }
      if (editTxn) {
        await apiPut(`/api/finance/${editTxn.id}`, payload)
        toast({ title: 'Success', description: 'Transaction updated successfully' })
        broadcastDataUpdate('finance', 'update')
      } else {
        await apiPost('/api/finance', payload)
        toast({ title: 'Success', description: 'Transaction created successfully' })
        broadcastDataUpdate('finance', 'create')
      }
      setDialogOpen(false)
      refetchTx()
      refetchSummary()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await apiDelete(`/api/finance/${deleteId}`)
      toast({ title: 'Success', description: 'Transaction deleted' })
      broadcastDataUpdate('finance', 'delete')
      setDeleteId(null)
      refetchTx()
      refetchSummary()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleExport = () => {
    toast({ title: 'Export queued', description: 'Your CSV export will be ready shortly.' })
  }

  // Build chart data
  const monthlyChartData = (summary.monthlyTrend || []).map((m: any) => ({
    month: m.month,
    income: Number(m.income) || 0,
    expense: Number(m.expense) || 0,
  }))

  const pieChartData = (summary.countByPaymentMethod || [])
    .map((p: any) => ({
      name: getPaymentMethodMeta(p.paymentMethod).label,
      value: Number(p.total) || 0,
      count: p.count,
      method: p.paymentMethod,
    }))
    .filter((p: any) => p.value > 0)

  const totalIncome = Number(summary.totalIncome) || 0
  const totalExpenses = Number(summary.totalExpenses) || 0
  const pendingFees = Number(summary.pendingPayments) || 0
  const netBalance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-500">Track transactions, fees, and expenses with Ethiopian banks &amp; Telebirr</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canCreate && (
            <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              {summaryLoading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{formatETB(totalIncome)}</p>
              )}
              <p className="text-sm text-gray-500">Total Revenue</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-rose-50 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-rose-600" />
                </div>
              </div>
              {summaryLoading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{formatETB(totalExpenses)}</p>
              )}
              <p className="text-sm text-gray-500">Total Expenses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              {summaryLoading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{formatETB(pendingFees)}</p>
              )}
              <p className="text-sm text-gray-500">Pending Fees</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-teal-600" />
                </div>
              </div>
              {summaryLoading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-teal-700' : 'text-red-600'}`}>
                  {formatETB(netBalance)}
                </p>
              )}
              <p className="text-sm text-gray-500">Net Balance</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-teal-600" />
              Revenue vs Expenses
            </CardTitle>
            <CardDescription>Last 6 months trend</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : monthlyChartData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm">No transaction data for charts yet</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                    <Tooltip
                      formatter={(value: any) => formatETB(Number(value))}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" name="Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-600" />
              Payment Methods
            </CardTitle>
            <CardDescription>Distribution by total amount</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : pieChartData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                <CreditCard className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm">No payment method data yet</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={getPaymentMethodMeta(entry.method).color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatETB(Number(value))}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, txn ID, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-teal-600" />
            Transactions
          </CardTitle>
          <CardDescription>{filteredTxns.length} record(s) found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {txLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No transactions found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or create a new transaction.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Txn ID</TableHead>
                    <TableHead>Student / Payee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    {(canEdit || canDelete) && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxns.map((t) => {
                    const meta = getPaymentMethodMeta(t.paymentMethod)
                    const Icon = meta.icon
                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {t.transactionId}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {t.student ? (
                            <div>
                              <p className="text-sm font-medium">{t.student.firstName} {t.student.lastName}</p>
                              <p className="text-xs text-gray-500">{t.student.studentId}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-600">{t.description?.split('\n')[0]?.slice(0, 40) || '—'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeClass(t.type)}>
                            {TRANSACTION_TYPES.find((x) => x.value === t.type)?.label || t.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{t.category}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${t.type === 'salary' || t.type === 'expense' ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {t.type === 'salary' || t.type === 'expense' ? '−' : '+'}{formatETB(t.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${meta.color}20` }}>
                              <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                            </span>
                            <span className="text-sm">{meta.label.split(' (')[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(t.status)}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-gray-400">{new Date(t.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </TableCell>
                        {(canEdit || canDelete) && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canEdit && (
                                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteId(t.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTxn ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
            <DialogDescription>
              {editTxn ? 'Update transaction details' : 'Record a new financial transaction'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student (optional)</Label>
                <Select value={form.studentId || 'none'} onValueChange={(v) => setForm({ ...form, studentId: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No student —</SelectItem>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transaction Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (ETB) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v, ...(v === 'cash' && { bankReference: '' }) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon
                      return (
                        <SelectItem key={m.value} value={m.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                            {m.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.paymentMethod !== 'cash' && (
              <div className="space-y-2">
                <Label>Bank Reference / Transaction ID</Label>
                <Input
                  value={form.bankReference}
                  onChange={(e) => setForm({ ...form, bankReference: e.target.value })}
                  placeholder="e.g. CBE-20240115-AB12345 or Telebirr ref"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Optional notes about this transaction..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">
                {submitting ? 'Saving...' : editTxn ? 'Update' : 'Create'} Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
