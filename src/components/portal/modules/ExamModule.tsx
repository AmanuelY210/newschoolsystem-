'use client'

import { useState } from 'react'
import { useAppStore, UserRole } from '@/lib/store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { hasPermission } from '@/lib/auth'
import { Plus, Search, Edit, Trash2, ClipboardCheck } from 'lucide-react'

const emptyForm = {
  examTypeId: '', academicYearId: '', name: '', gradeId: '', subjectId: '',
  examDate: '', totalMarks: '100', passingMarks: '50', status: 'scheduled',
}

export function ExamModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data: examTypesData } = useApi<{ examTypes: any[] }>('/api/exam-types')
  const examTypes = examTypesData?.examTypes || []

  const { data: yearsData } = useApi<{ academicYears: any[] }>('/api/academic-years')
  const academicYears = yearsData?.academicYears || []

  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  const grades = gradesData?.grades || []

  const { data: subjectsData } = useApi<{ subjects: any[] }>('/api/subjects')
  const subjects = subjectsData?.subjects || []

  const { data, loading, refetch } = useApi<{ exams: any[] }>('/api/exams')
  const items = data?.exams || []
  const canManage = hasPermission(role, 'exam.*')

  const filtered = items.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const openCreate = () => {
    setForm({
      ...emptyForm,
      examTypeId: examTypes[0]?.id || '',
      academicYearId: academicYears.find(y => y.isCurrent)?.id || academicYears[0]?.id || '',
    })
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      examTypeId: item.examTypeId || '',
      academicYearId: item.academicYearId || '',
      name: item.name || '',
      gradeId: item.gradeId || '',
      subjectId: item.subjectId || '',
      examDate: item.examDate ? item.examDate.split('T')[0] : '',
      totalMarks: String(item.totalMarks ?? '100'),
      passingMarks: String(item.passingMarks ?? '50'),
      status: item.status || 'scheduled',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.examTypeId || !form.name || !form.examDate) {
      toast({ title: 'Error', description: 'Exam type, name, and date are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
      }
      if (editItem) {
        await apiPut(`/api/exams/${editItem.id}`, payload)
        toast({ title: 'Success', description: 'Exam updated' })
      } else {
        await apiPost('/api/exams', payload)
        toast({ title: 'Success', description: 'Exam created' })
      }
      setDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await apiDelete(`/api/exams/${deleteId}`)
      toast({ title: 'Success', description: 'Exam deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const statusBadgeClass = (status: string) => {
    if (status === 'scheduled') return 'bg-blue-100 text-blue-700'
    if (status === 'ongoing') return 'bg-amber-100 text-amber-700'
    if (status === 'completed') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-500">Manage scheduled, ongoing, and completed exams</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800" disabled={examTypes.length === 0}>
            <Plus className="h-4 w-4 mr-2" /> Add Exam
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Total Exams</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-blue-600">{items.filter(e => e.status === 'scheduled').length}</p><p className="text-sm text-gray-500">Scheduled</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{items.filter(e => e.status === 'ongoing').length}</p><p className="text-sm text-gray-500">Ongoing</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(e => e.status === 'completed').length}</p><p className="text-sm text-gray-500">Completed</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No exams found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell><Badge variant="outline">{e.examType?.name || '-'}</Badge></TableCell>
                      <TableCell className="text-sm">{e.grade?.name || <span className="text-gray-400">All</span>}</TableCell>
                      <TableCell className="text-sm">{e.subject?.name || <span className="text-gray-400">All</span>}</TableCell>
                      <TableCell className="text-sm">{e.examDate ? new Date(e.examDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-sm">{e.passingMarks}/{e.totalMarks}</TableCell>
                      <TableCell><Badge className={statusBadgeClass(e.status)}>{e.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canManage && <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Edit className="h-4 w-4" /></Button>}
                          {canManage && <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update exam info' : 'Create a new exam'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exam Type *</Label>
                <Select value={form.examTypeId} onValueChange={(v) => setForm({ ...form, examTypeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select exam type" /></SelectTrigger>
                  <SelectContent>
                    {examTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={form.academicYearId} onValueChange={(v) => setForm({ ...form, academicYearId: v })}>
                  <SelectTrigger><SelectValue placeholder="Not specified" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    {academicYears.map(y => <SelectItem key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' (Current)' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Exam Name *</Label>
              <Input placeholder="e.g. Midterm Exam - Mathematics" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={form.gradeId} onValueChange={(v) => setForm({ ...form, gradeId: v })}>
                  <SelectTrigger><SelectValue placeholder="All grades" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Grades</SelectItem>
                    {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="All subjects" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Exam Date *</Label><Input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></div>
              <div className="space-y-2"><Label>Passing Marks</Label><Input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-teal-700 hover:bg-teal-800">{submitting ? 'Saving...' : editItem ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
