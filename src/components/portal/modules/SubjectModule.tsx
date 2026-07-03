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
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react'

const emptyForm = {
  name: '', code: '', gradeId: '', creditHours: '1', passingMarks: '50', totalMarks: '100', status: 'active',
}

export function SubjectModule() {
  const { user } = useAppStore()
  const role = user?.role as UserRole
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const { data: gradesData } = useApi<{ grades: any[] }>('/api/grades')
  const grades = gradesData?.grades || []

  const queryString = gradeFilter !== 'all' ? `?gradeId=${gradeFilter}` : ''
  const { data, loading, refetch } = useApi<{ subjects: any[] }>(`/api/subjects${queryString}`)
  const items = data?.subjects || []
  const canManage = hasPermission(role, 'subject.*')

  const filtered = items.filter(s => {
    if (!search) return true
    return s.name.toLowerCase().includes(search.toLowerCase()) || (s.code || '').toLowerCase().includes(search.toLowerCase())
  })

  const openCreate = () => {
    setForm({ ...emptyForm, gradeId: gradeFilter !== 'all' ? gradeFilter : (grades[0]?.id || '') })
    setEditItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setForm({
      name: item.name || '',
      code: item.code || '',
      gradeId: item.gradeId || '',
      creditHours: String(item.creditHours ?? '1'),
      passingMarks: String(item.passingMarks ?? '50'),
      totalMarks: String(item.totalMarks ?? '100'),
      status: item.status || 'active',
    })
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.code) {
      toast({ title: 'Error', description: 'Name and code are required', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        creditHours: Number(form.creditHours),
        passingMarks: Number(form.passingMarks),
        totalMarks: Number(form.totalMarks),
      }
      if (editItem) {
        await apiPut(`/api/subjects/${editItem.id}`, payload)
        toast({ title: 'Success', description: 'Subject updated' })
      } else {
        await apiPost('/api/subjects', payload)
        toast({ title: 'Success', description: 'Subject created' })
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
      await apiDelete(`/api/subjects/${deleteId}`)
      toast({ title: 'Success', description: 'Subject deleted' })
      setDeleteId(null)
      refetch()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500">Manage subjects offered by the school</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800">
            <Plus className="h-4 w-4 mr-2" /> Add Subject
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-teal-700">{items.length}</p><p className="text-sm text-gray-500">Total Subjects</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(s => s.status === 'active').length}</p><p className="text-sm text-gray-500">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{items.filter(s => !s.gradeId).length}</p><p className="text-sm text-gray-500">General</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-purple-600">{grades.length}</p><p className="text-sm text-gray-500">Grades</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Filter by grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="general">General (no grade)</SelectItem>
                {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
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
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No subjects found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Credit Hours</TableHead>
                    <TableHead>Passing / Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono">{s.code}</Badge></TableCell>
                      <TableCell className="text-sm">{s.grade?.name || <span className="text-gray-400">General</span>}</TableCell>
                      <TableCell><Badge className="bg-teal-50 text-teal-700">{s.creditHours}</Badge></TableCell>
                      <TableCell className="text-sm">{s.passingMarks} / {s.totalMarks}</TableCell>
                      <TableCell><Badge className={s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{s.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {canManage && <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>}
                          {canManage && <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
            <DialogDescription>{editItem ? 'Update subject info' : 'Create a new subject'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input placeholder="e.g. Mathematics" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Code *</Label><Input placeholder="e.g. MATH101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={form.gradeId} onValueChange={(v) => setForm({ ...form, gradeId: v })}>
                <SelectTrigger><SelectValue placeholder="General (no grade)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General (no grade)</SelectItem>
                  {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Credit Hours</Label><Input type="number" value={form.creditHours} onChange={(e) => setForm({ ...form, creditHours: e.target.value })} /></div>
              <div className="space-y-2"><Label>Passing Marks</Label><Input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} /></div>
              <div className="space-y-2"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the subject. Related marks and assignments may be affected.</AlertDialogDescription>
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
