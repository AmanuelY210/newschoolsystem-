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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import {
  Plus, Edit, Trash2, Search, BookOpen, Library, BookMarked, Users,
  CheckCircle2, AlertCircle, BookCopy, ArrowLeftRight, MapPin, Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'

const BOOK_CATEGORIES = [
  'general', 'fiction', 'science', 'history', 'mathematics', 'literature',
  'biology', 'chemistry', 'physics', 'geography', 'religion', 'biography',
  'children', 'reference', 'textbook',
]

const emptyBookForm = {
  title: '',
  author: '',
  isbn: '',
  category: 'general',
  publisher: '',
  edition: '',
  year: '',
  totalCopies: '1',
  shelfLocation: '',
  description: '',
  coverUrl: '',
}

const emptyLoanForm = {
  bookId: '',
  studentId: '',
  borrowerName: '',
  borrowerType: 'student',
  dueDate: '',
}

function categoryBadgeClass(category: string) {
  // hash category to color
  const colors = [
    'bg-teal-100 text-teal-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
    'bg-purple-100 text-purple-700',
    'bg-cyan-100 text-cyan-700',
  ]
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash + category.charCodeAt(i)) % colors.length
  return colors[hash]
}

function isOverdue(loan: any) {
  if (loan.status === 'returned' || loan.returnDate) return false
  return new Date(loan.dueDate) < new Date()
}

export function LibraryModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const { broadcastDataUpdate } = useWebSocket()

  const [tab, setTab] = useState<'books' | 'loans'>('books')

  // Books state
  const [bookSearch, setBookSearch] = useState('')
  const [bookCategory, setBookCategory] = useState('all')
  const [bookStatus, setBookStatus] = useState('all')
  const [bookDialogOpen, setBookDialogOpen] = useState(false)
  const [editBook, setEditBook] = useState<any>(null)
  const [bookForm, setBookForm] = useState<any>(emptyBookForm)
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null)
  const [submittingBook, setSubmittingBook] = useState(false)

  // Loan state
  const [loanDialogOpen, setLoanDialogOpen] = useState(false)
  const [loanForm, setLoanForm] = useState<any>(emptyLoanForm)
  const [submittingLoan, setSubmittingLoan] = useState(false)
  const [returnLoanId, setReturnLoanId] = useState<string | null>(null)
  const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null)

  const canCreate = hasPermission(role, 'library.create')
  const canEdit = hasPermission(role, 'library.edit')
  const canDelete = hasPermission(role, 'library.delete')

  // Fetch books with filters
  const bookQuery = new URLSearchParams({
    ...(bookSearch && { search: bookSearch }),
    ...(bookCategory !== 'all' && { category: bookCategory }),
    ...(bookStatus !== 'all' && { status: bookStatus }),
  }).toString()
  const { data: bookData, loading: bookLoading, refetch: refetchBooks } = useApi<{ books: any[] }>(
    `/api/books${bookQuery ? `?${bookQuery}` : ''}`
  )
  const { data: loanData, loading: loanLoading, refetch: refetchLoans } = useApi<{ loans: any[] }>(
    '/api/loans'
  )
  const { data: studentsData } = useApi<{ students: any[] }>('/api/students')
  const students = studentsData?.students || []

  const books = bookData?.books || []
  const loans = loanData?.loans || []

  // Derived book stats
  const totalBooks = books.length
  const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0)
  const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0)
  const borrowedCopies = totalCopies - availableCopies
  const categoriesCount = new Set(books.map((b) => b.category)).size

  // Derived loan stats
  const totalLoans = loans.length
  const activeLoans = loans.filter((l) => l.status === 'borrowed' && !isOverdue(l)).length
  const overdueLoans = loans.filter((l) => isOverdue(l)).length
  const returnedLoans = loans.filter((l) => l.status === 'returned').length

  // ===== Book handlers =====
  const openCreateBook = () => {
    setBookForm(emptyBookForm)
    setEditBook(null)
    setBookDialogOpen(true)
  }
  const openEditBook = (b: any) => {
    setBookForm({
      title: b.title || '',
      author: b.author || '',
      isbn: b.isbn || '',
      category: b.category || 'general',
      publisher: b.publisher || '',
      edition: b.edition || '',
      year: b.year ? String(b.year) : '',
      totalCopies: String(b.totalCopies ?? 1),
      shelfLocation: b.shelfLocation || '',
      description: b.description || '',
      coverUrl: b.coverUrl || '',
    })
    setEditBook(b)
    setBookDialogOpen(true)
  }
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookForm.title || !bookForm.author) {
      toast({ title: 'Error', description: 'Title and author are required', variant: 'destructive' })
      return
    }
    setSubmittingBook(true)
    try {
      const payload: any = {
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn || null,
        category: bookForm.category,
        publisher: bookForm.publisher || null,
        edition: bookForm.edition || null,
        year: bookForm.year ? parseInt(bookForm.year, 10) : null,
        totalCopies: parseInt(bookForm.totalCopies, 10) || 1,
        shelfLocation: bookForm.shelfLocation || null,
        description: bookForm.description || null,
        coverUrl: bookForm.coverUrl || null,
      }
      if (editBook) {
        await apiPut(`/api/books/${editBook.id}`, payload)
        toast({ title: 'Success', description: 'Book updated successfully' })
        broadcastDataUpdate('book', 'update')
      } else {
        await apiPost('/api/books', payload)
        toast({ title: 'Success', description: 'Book added to library' })
        broadcastDataUpdate('book', 'create')
      }
      setBookDialogOpen(false)
      refetchBooks()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmittingBook(false)
    }
  }
  const handleBookDelete = async () => {
    if (!deleteBookId) return
    try {
      await apiDelete(`/api/books/${deleteBookId}`)
      toast({ title: 'Success', description: 'Book deleted' })
      broadcastDataUpdate('book', 'delete')
      setDeleteBookId(null)
      refetchBooks()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  // ===== Loan handlers =====
  const openIssueLoan = (presetBookId?: string) => {
    setLoanForm({ ...emptyLoanForm, bookId: presetBookId || '' })
    setLoanDialogOpen(true)
  }
  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loanForm.bookId || !loanForm.dueDate) {
      toast({ title: 'Error', description: 'Book and due date are required', variant: 'destructive' })
      return
    }
    if (!loanForm.studentId && !loanForm.borrowerName) {
      toast({ title: 'Error', description: 'Please select a student or enter borrower name', variant: 'destructive' })
      return
    }
    setSubmittingLoan(true)
    try {
      await apiPost('/api/loans', {
        bookId: loanForm.bookId,
        studentId: loanForm.studentId || null,
        borrowerName: loanForm.borrowerName || null,
        borrowerType: loanForm.borrowerType,
        dueDate: loanForm.dueDate,
      })
      toast({ title: 'Success', description: 'Book issued successfully' })
      broadcastDataUpdate('loan', 'create')
      setLoanDialogOpen(false)
      refetchLoans()
      refetchBooks()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmittingLoan(false)
    }
  }
  const handleReturnLoan = async () => {
    if (!returnLoanId) return
    try {
      await apiPut(`/api/loans/${returnLoanId}`, { status: 'returned' })
      toast({ title: 'Success', description: 'Book returned successfully' })
      broadcastDataUpdate('loan', 'update')
      setReturnLoanId(null)
      refetchLoans()
      refetchBooks()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }
  const handleLoanDelete = async () => {
    if (!deleteLoanId) return
    try {
      await apiDelete(`/api/loans/${deleteLoanId}`)
      toast({ title: 'Success', description: 'Loan record deleted' })
      broadcastDataUpdate('loan', 'delete')
      setDeleteLoanId(null)
      refetchLoans()
      refetchBooks()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
          <p className="text-gray-500">Manage books, loans, and track overdue returns</p>
        </div>
        {canCreate && tab === 'books' && (
          <Button onClick={openCreateBook} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        )}
        {canCreate && tab === 'loans' && (
          <Button onClick={() => openIssueLoan()} className="bg-teal-700 hover:bg-teal-800">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Issue Book
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'books' | 'loans')}>
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="books" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="loans" className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Loans
          </TabsTrigger>
        </TabsList>

        {/* ===== BOOKS TAB ===== */}
        <TabsContent value="books" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Library className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
                {bookLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>}
                <p className="text-sm text-gray-500">Total Titles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                {bookLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-emerald-700">{availableCopies}</p>}
                <p className="text-sm text-gray-500">Available Copies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <BookCopy className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                {bookLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-orange-700">{borrowedCopies}</p>}
                <p className="text-sm text-gray-500">Borrowed Copies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <BookMarked className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                {bookLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-purple-700">{categoriesCount}</p>}
                <p className="text-sm text-gray-500">Categories</p>
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
                    placeholder="Search by title, author, ISBN, or book ID..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={bookCategory} onValueChange={setBookCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {BOOK_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={bookStatus} onValueChange={setBookStatus}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Books grid */}
          {bookLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          ) : books.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No books found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or add a new book.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b, i) => {
                const pct = b.totalCopies > 0 ? Math.round((b.availableCopies / b.totalCopies) * 100) : 0
                const isAvailable = b.availableCopies > 0
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-teal-600 to-emerald-700 relative flex items-center justify-center">
                        {b.coverUrl ? (
                          <img src={b.coverUrl} alt={b.title} className="h-full w-full object-cover" />
                        ) : (
                          <BookOpen className="h-12 w-12 text-white/80" />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className={isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}>
                            {isAvailable ? 'Available' : 'Out'}
                          </Badge>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="font-mono text-[10px] bg-white/90 text-gray-700">
                            {b.bookId}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{b.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">by {b.author}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={categoryBadgeClass(b.category || 'general')}>
                            <span className="capitalize">{b.category}</span>
                          </Badge>
                          {b.shelfLocation && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {b.shelfLocation}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Copies</span>
                            <span className="font-medium">
                              {b.availableCopies} / {b.totalCopies} available
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pct > 50 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 pt-1 border-t">
                          {canCreate && isAvailable && (
                            <Button variant="ghost" size="sm" onClick={() => openIssueLoan(b.id)}>
                              <ArrowLeftRight className="h-4 w-4 mr-1" />
                              Issue
                            </Button>
                          )}
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => openEditBook(b)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteBookId(b.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== LOANS TAB ===== */}
        <TabsContent value="loans" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                    <ArrowLeftRight className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
                {loanLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-gray-900">{totalLoans}</p>}
                <p className="text-sm text-gray-500">Total Loans</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                {loanLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-emerald-700">{activeLoans}</p>}
                <p className="text-sm text-gray-500">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                  </div>
                </div>
                {loanLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-rose-700">{overdueLoans}</p>}
                <p className="text-sm text-gray-500">Overdue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                {loanLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-purple-700">{returnedLoans}</p>}
                <p className="text-sm text-gray-500">Returned</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookCopy className="h-5 w-5 text-teal-600" />
                Loan Records
              </CardTitle>
              <CardDescription>{loans.length} loan(s) recorded</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loanLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : loans.length === 0 ? (
                <div className="p-12 text-center">
                  <ArrowLeftRight className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No loans recorded yet</p>
                  {canCreate && (
                    <Button onClick={() => openIssueLoan()} variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Issue First Book
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Borrow Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Fine</TableHead>
                        {(canEdit || canDelete) && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((l) => {
                        const overdue = isOverdue(l)
                        const isReturned = l.status === 'returned' || !!l.returnDate
                        return (
                          <TableRow key={l.id} className={overdue ? 'bg-rose-50' : ''}>
                            <TableCell>
                              <p className="text-sm font-medium line-clamp-1">{l.book?.title || '—'}</p>
                              <p className="text-xs text-gray-500">{l.book?.bookId}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{l.borrowerName}</p>
                              {l.student && <p className="text-xs text-gray-500">{l.student.studentId}</p>}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-xs">{l.borrowerType}</Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{new Date(l.borrowDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </TableCell>
                            <TableCell>
                              <p className={`text-sm ${overdue ? 'text-rose-700 font-semibold' : ''}`}>
                                {new Date(l.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              {overdue && <p className="text-xs text-rose-600">Overdue</p>}
                            </TableCell>
                            <TableCell>
                              {l.returnDate ? (
                                <p className="text-sm">{new Date(l.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                isReturned ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                overdue ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' :
                                'bg-amber-100 text-amber-700 hover:bg-amber-100'
                              }>
                                {isReturned ? 'returned' : overdue ? 'overdue' : l.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {l.fine > 0 ? (
                                <span className="text-sm font-semibold text-rose-600">{l.fine.toLocaleString()} ETB</span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            {(canEdit || canDelete) && (
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {canEdit && !isReturned && (
                                    <Button variant="ghost" size="icon" onClick={() => setReturnLoanId(l.id)} title="Return book">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                  )}
                                  {canDelete && (
                                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDeleteLoanId(l.id)}>
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
        </TabsContent>
      </Tabs>

      {/* Book Create/Edit Dialog */}
      <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            <DialogDescription>
              {editBook ? 'Update book information' : 'Add a new book to the library catalog'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title *</Label>
                <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Author *</Label>
                <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>ISBN</Label>
                <Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="978-..." />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={bookForm.category} onValueChange={(v) => setBookForm({ ...bookForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Publisher</Label>
                <Input value={bookForm.publisher} onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Edition</Label>
                <Input value={bookForm.edition} onChange={(e) => setBookForm({ ...bookForm, edition: e.target.value })} placeholder="e.g. 3rd" />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={bookForm.year} onChange={(e) => setBookForm({ ...bookForm, year: e.target.value })} placeholder="2024" />
              </div>
              <div className="space-y-2">
                <Label>Total Copies *</Label>
                <Input type="number" min="1" value={bookForm.totalCopies} onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Shelf Location</Label>
                <Input value={bookForm.shelfLocation} onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })} placeholder="e.g. A-12-3" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Cover Image URL</Label>
                <Input value={bookForm.coverUrl} onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBookDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submittingBook} className="bg-teal-700 hover:bg-teal-800">
                {submittingBook ? 'Saving...' : editBook ? 'Update' : 'Add'} Book
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Issue Book</DialogTitle>
            <DialogDescription>Lend a book to a student or external borrower</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoanSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Book *</Label>
              <Select value={loanForm.bookId} onValueChange={(v) => setLoanForm({ ...loanForm, bookId: v })}>
                <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                <SelectContent>
                  {books.filter((b) => b.availableCopies > 0).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title} — {b.bookId} ({b.availableCopies} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Student</Label>
                <Select
                  value={loanForm.studentId || 'none'}
                  onValueChange={(v) => setLoanForm({ ...loanForm, studentId: v === 'none' ? '' : v, ...(v !== 'none' && { borrowerName: '' }) })}
                >
                  <SelectTrigger><SelectValue placeholder="— None —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None (external borrower) —</SelectItem>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Borrower Type</Label>
                <Select value={loanForm.borrowerType} onValueChange={(v) => setLoanForm({ ...loanForm, borrowerType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!loanForm.studentId && (
              <div className="space-y-2">
                <Label>Borrower Name *</Label>
                <Input
                  value={loanForm.borrowerName}
                  onChange={(e) => setLoanForm({ ...loanForm, borrowerName: e.target.value })}
                  placeholder="Enter borrower's full name"
                  required={!loanForm.studentId}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={loanForm.dueDate}
                onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Late returns incur a 5 ETB / day fine.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLoanDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submittingLoan} className="bg-teal-700 hover:bg-teal-800">
                {submittingLoan ? 'Issuing...' : 'Issue Book'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Return Confirmation */}
      <AlertDialog open={!!returnLoanId} onOpenChange={(open) => !open && setReturnLoanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the loan as returned and calculate any overdue fine. The book&apos;s available copies will be incremented.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturnLoan} className="bg-teal-700 hover:bg-teal-800">
              Confirm Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Book Confirmation */}
      <AlertDialog open={!!deleteBookId} onOpenChange={(open) => !open && setDeleteBookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book from the catalog. Active loans for this book may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBookDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Loan Confirmation */}
      <AlertDialog open={!!deleteLoanId} onOpenChange={(open) => !open && setDeleteLoanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the loan record. If the book has not been returned, the available copy will be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoanDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
